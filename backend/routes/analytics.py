from fastapi import APIRouter
from database import db
from datetime import datetime, timedelta

router = APIRouter()


@router.get("/analytics/overview")
async def get_analytics_overview():
    now = datetime.utcnow()
    week_ago = now - timedelta(days=7)
    month_ago = now - timedelta(days=30)

    total_orders = await db.orders.count_documents({})
    total_products = await db.products.count_documents({})
    total_farms = await db.farms.count_documents({})
    total_drivers = await db.drivers.count_documents({})

    revenue_pipeline = [
        {"$match": {"order_status": {"$ne": "cancelled"}}},
        {"$group": {"_id": None, "total": {"$sum": "$total"}}}
    ]
    revenue_result = await db.orders.aggregate(revenue_pipeline).to_list(1)
    total_revenue = revenue_result[0]["total"] if revenue_result else 0

    monthly_pipeline = [
        {"$match": {"created_at": {"$gte": month_ago}, "order_status": {"$ne": "cancelled"}}},
        {"$group": {"_id": None, "revenue": {"$sum": "$total"}, "count": {"$sum": 1}}}
    ]
    monthly_result = await db.orders.aggregate(monthly_pipeline).to_list(1)
    monthly_revenue = monthly_result[0]["revenue"] if monthly_result else 0
    monthly_orders = monthly_result[0]["count"] if monthly_result else 0

    weekly_pipeline = [
        {"$match": {"created_at": {"$gte": week_ago}, "order_status": {"$ne": "cancelled"}}},
        {"$group": {"_id": None, "revenue": {"$sum": "$total"}, "count": {"$sum": 1}}}
    ]
    weekly_result = await db.orders.aggregate(weekly_pipeline).to_list(1)
    weekly_revenue = weekly_result[0]["revenue"] if weekly_result else 0
    weekly_orders = weekly_result[0]["count"] if weekly_result else 0

    avg_order_value = total_revenue / total_orders if total_orders > 0 else 0

    return {
        "total_revenue": total_revenue,
        "total_orders": total_orders,
        "monthly_revenue": monthly_revenue,
        "monthly_orders": monthly_orders,
        "weekly_revenue": weekly_revenue,
        "weekly_orders": weekly_orders,
        "average_order_value": avg_order_value,
        "total_products": total_products,
        "total_farms": total_farms,
        "total_drivers": total_drivers,
    }


@router.get("/analytics/revenue-chart")
async def get_revenue_chart(days: int = 30):
    now = datetime.utcnow()
    start_date = now - timedelta(days=days)

    pipeline = [
        {"$match": {"created_at": {"$gte": start_date}, "order_status": {"$ne": "cancelled"}}},
        {"$group": {
            "_id": {"$dateToString": {"format": "%Y-%m-%d", "date": "$created_at"}},
            "revenue": {"$sum": "$total"},
            "orders": {"$sum": 1}
        }},
        {"$sort": {"_id": 1}}
    ]

    results = await db.orders.aggregate(pipeline).to_list(days)

    date_map = {}
    for r in results:
        date_map[r["_id"]] = {"revenue": r["revenue"], "orders": r["orders"]}

    chart_data = []
    for i in range(days):
        date = start_date + timedelta(days=i)
        date_str = date.strftime("%Y-%m-%d")
        data = date_map.get(date_str, {"revenue": 0, "orders": 0})
        chart_data.append({
            "date": date_str,
            "revenue": data["revenue"],
            "orders": data["orders"]
        })

    return chart_data


@router.get("/analytics/top-products")
async def get_top_products(limit: int = 10):
    pipeline = [
        {"$match": {"order_status": {"$ne": "cancelled"}}},
        {"$unwind": "$items"},
        {"$group": {
            "_id": "$items.product_id",
            "product_name": {"$first": "$items.product_name"},
            "farm_name": {"$first": "$items.farm_name"},
            "total_quantity": {"$sum": "$items.quantity"},
            "total_revenue": {"$sum": "$items.subtotal"}
        }},
        {"$sort": {"total_revenue": -1}},
        {"$limit": limit}
    ]
    return await db.orders.aggregate(pipeline).to_list(limit)


@router.get("/analytics/top-farms")
async def get_top_farms(limit: int = 10):
    pipeline = [
        {"$match": {"order_status": {"$ne": "cancelled"}}},
        {"$unwind": "$items"},
        {"$group": {
            "_id": "$items.farm_name",
            "total_orders": {"$sum": 1},
            "total_revenue": {"$sum": "$items.subtotal"},
            "total_items": {"$sum": "$items.quantity"}
        }},
        {"$sort": {"total_revenue": -1}},
        {"$limit": limit}
    ]
    return await db.orders.aggregate(pipeline).to_list(limit)


@router.get("/analytics/order-status-distribution")
async def get_order_status_distribution():
    pipeline = [
        {"$group": {"_id": "$order_status", "count": {"$sum": 1}}}
    ]
    results = await db.orders.aggregate(pipeline).to_list(20)
    return {r["_id"]: r["count"] for r in results}
