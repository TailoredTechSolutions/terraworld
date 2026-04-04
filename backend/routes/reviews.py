from fastapi import APIRouter, HTTPException
from models import Review, ReviewCreate
from database import db
from datetime import datetime

router = APIRouter()


async def update_product_rating(product_id: str):
    pipeline = [
        {"$match": {"product_id": product_id}},
        {"$group": {"_id": None, "avg_rating": {"$avg": "$rating"}, "count": {"$sum": 1}}}
    ]
    result = await db.reviews.aggregate(pipeline).to_list(1)
    if result:
        await db.products.update_one(
            {"id": product_id},
            {"$set": {"rating": result[0]["avg_rating"], "review_count": result[0]["count"]}}
        )


async def update_farm_rating(farm_id: str):
    pipeline = [
        {"$match": {"farm_id": farm_id}},
        {"$group": {"_id": None, "avg_rating": {"$avg": "$rating"}, "count": {"$sum": 1}}}
    ]
    result = await db.reviews.aggregate(pipeline).to_list(1)
    if result:
        await db.farms.update_one(
            {"id": farm_id},
            {"$set": {"rating": result[0]["avg_rating"], "review_count": result[0]["count"]}}
        )


@router.post("/reviews", response_model=Review)
async def create_review(user_id: str, user_name: str, review: ReviewCreate):
    review_obj = Review(user_id=user_id, user_name=user_name, **review.dict())
    await db.reviews.insert_one(review_obj.dict())

    if review.product_id:
        await update_product_rating(review.product_id)
    if review.farm_id:
        await update_farm_rating(review.farm_id)

    return review_obj


@router.get("/reviews/product/{product_id}")
async def get_product_reviews(product_id: str, skip: int = 0, limit: int = 20):
    reviews = await db.reviews.find({"product_id": product_id}, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    total = await db.reviews.count_documents({"product_id": product_id})

    distribution = {i: 0 for i in range(1, 6)}
    async for doc in db.reviews.aggregate([
        {"$match": {"product_id": product_id}},
        {"$group": {"_id": "$rating", "count": {"$sum": 1}}}
    ]):
        distribution[doc["_id"]] = doc["count"]

    avg_result = await db.reviews.aggregate([
        {"$match": {"product_id": product_id}},
        {"$group": {"_id": None, "avg": {"$avg": "$rating"}}}
    ]).to_list(1)
    avg_rating = avg_result[0]["avg"] if avg_result else 0

    return {
        "reviews": reviews,
        "total": total,
        "average_rating": avg_rating,
        "distribution": distribution
    }


@router.get("/reviews/farm/{farm_id}")
async def get_farm_reviews(farm_id: str, skip: int = 0, limit: int = 20):
    reviews = await db.reviews.find({"farm_id": farm_id}, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    total = await db.reviews.count_documents({"farm_id": farm_id})

    avg_result = await db.reviews.aggregate([
        {"$match": {"farm_id": farm_id}},
        {"$group": {"_id": None, "avg": {"$avg": "$rating"}}}
    ]).to_list(1)
    avg_rating = avg_result[0]["avg"] if avg_result else 0

    return {
        "reviews": reviews,
        "total": total,
        "average_rating": avg_rating,
    }
