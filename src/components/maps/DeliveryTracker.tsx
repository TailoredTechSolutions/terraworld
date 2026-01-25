import { useState, useEffect } from "react";
import { Truck, MapPin, Clock, Phone, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface DeliveryTrackerProps {
  orderId: string;
  estimatedMinutes?: number;
}

type DeliveryStatus = "confirmed" | "preparing" | "picked_up" | "on_the_way" | "delivered";

interface DriverInfo {
  name: string;
  phone: string;
  vehicle: string;
  plateNumber: string;
  photo: string;
}

const statusSteps: { status: DeliveryStatus; label: string; icon: React.ReactNode }[] = [
  { status: "confirmed", label: "Order Confirmed", icon: <CheckCircle2 className="h-4 w-4" /> },
  { status: "preparing", label: "Preparing", icon: <Clock className="h-4 w-4" /> },
  { status: "picked_up", label: "Picked Up", icon: <Truck className="h-4 w-4" /> },
  { status: "on_the_way", label: "On the Way", icon: <Truck className="h-4 w-4" /> },
  { status: "delivered", label: "Delivered", icon: <MapPin className="h-4 w-4" /> },
];

const DeliveryTracker = ({ orderId, estimatedMinutes = 45 }: DeliveryTrackerProps) => {
  const [currentStatus, setCurrentStatus] = useState<DeliveryStatus>("confirmed");
  const [progress, setProgress] = useState(10);
  const [timeRemaining, setTimeRemaining] = useState(estimatedMinutes);

  // Demo driver info
  const driver: DriverInfo = {
    name: "Miguel Santos",
    phone: "+63 917 123 4567",
    vehicle: "Motorcycle",
    plateNumber: "ABC 1234",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
  };

  // Simulate delivery progress for demo
  useEffect(() => {
    const statusOrder: DeliveryStatus[] = ["confirmed", "preparing", "picked_up", "on_the_way", "delivered"];
    let currentIndex = 0;

    const interval = setInterval(() => {
      if (currentIndex < statusOrder.length - 1) {
        currentIndex++;
        setCurrentStatus(statusOrder[currentIndex]);
        setProgress((currentIndex + 1) * 20);
        setTimeRemaining(prev => Math.max(0, prev - Math.floor(estimatedMinutes / 4)));
      } else {
        clearInterval(interval);
      }
    }, 5000); // Progress every 5 seconds for demo

    return () => clearInterval(interval);
  }, [estimatedMinutes]);

  const getCurrentStepIndex = () => {
    return statusSteps.findIndex(step => step.status === currentStatus);
  };

  const showDriverInfo = currentStatus === "picked_up" || currentStatus === "on_the_way";

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-primary/5 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Order #{orderId}</p>
            <h3 className="font-display font-semibold text-foreground">
              {currentStatus === "delivered" ? "Order Delivered!" : "Tracking Your Order"}
            </h3>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Estimated arrival</p>
            <p className="font-semibold text-primary">
              {currentStatus === "delivered" ? "Delivered" : `${timeRemaining} min`}
            </p>
          </div>
        </div>
        <Progress value={progress} className="mt-4 h-2" />
      </div>

      {/* Status Steps */}
      <div className="p-4">
        <div className="space-y-3">
          {statusSteps.map((step, index) => {
            const isCompleted = index <= getCurrentStepIndex();
            const isCurrent = step.status === currentStatus;

            return (
              <div key={step.status} className="flex items-center gap-3">
                <div className={`
                  flex h-8 w-8 items-center justify-center rounded-full transition-all
                  ${isCompleted 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-secondary text-muted-foreground'
                  }
                  ${isCurrent ? 'ring-4 ring-primary/20' : ''}
                `}>
                  {step.icon}
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {step.label}
                  </p>
                  {isCurrent && currentStatus !== "delivered" && (
                    <p className="text-xs text-muted-foreground">In progress...</p>
                  )}
                </div>
                {isCompleted && <CheckCircle2 className="h-4 w-4 text-primary" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Driver Info */}
      {showDriverInfo && (
        <div className="p-4 border-t border-border bg-secondary/30">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3">Your Driver</p>
          <div className="flex items-center gap-3">
            <img 
              src={driver.photo} 
              alt={driver.name}
              className="h-12 w-12 rounded-full object-cover border-2 border-primary"
            />
            <div className="flex-1">
              <p className="font-medium text-foreground">{driver.name}</p>
              <p className="text-sm text-muted-foreground">
                {driver.vehicle} • {driver.plateNumber}
              </p>
            </div>
            <Button size="icon" variant="outline" className="rounded-full h-10 w-10">
              <Phone className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Live Location Preview */}
      {(currentStatus === "picked_up" || currentStatus === "on_the_way") && (
        <div className="h-40 relative bg-secondary">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-card border border-border text-sm">
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                <span>Driver is {currentStatus === "picked_up" ? "heading to you" : "nearby"}</span>
              </div>
            </div>
          </div>
          
          {/* Animated Route Line */}
          <svg className="absolute inset-0 w-full h-full">
            <defs>
              <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.2" />
                <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="1" />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.2" />
              </linearGradient>
            </defs>
            <path
              d="M 20 120 Q 80 40, 160 80 T 300 60"
              fill="none"
              stroke="url(#routeGradient)"
              strokeWidth="3"
              strokeDasharray="8 4"
              className="animate-pulse"
            />
          </svg>

          {/* Driver Position */}
          <div 
            className="absolute transform -translate-x-1/2 -translate-y-1/2"
            style={{ left: "40%", top: "50%" }}
          >
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center shadow-lg">
              <Truck className="h-4 w-4 text-primary-foreground" />
            </div>
          </div>

          {/* Destination */}
          <div 
            className="absolute transform -translate-x-1/2 -translate-y-1/2"
            style={{ left: "85%", top: "40%" }}
          >
            <div className="h-6 w-6 rounded-full bg-foreground flex items-center justify-center">
              <MapPin className="h-3 w-3 text-background" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryTracker;