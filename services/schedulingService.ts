import { TimeOfDay, ScheduleConfig, VehicleAllocation } from '@/types/scheduling';

/**
 * Service to manage dynamic vehicle scheduling based on time of day and usage patterns
 */
class SchedulingService {
  private timeOfDayThresholds = {
    morning: { start: 6, end: 12 },    // 6 AM - 12 PM
    afternoon: { start: 12, end: 17 },  // 12 PM - 5 PM
    evening: { start: 17, end: 22 },    // 5 PM - 10 PM
    night: { start: 22, end: 6 }        // 10 PM - 6 AM
  };

  /**
   * Get the current time of day period
   */
  getCurrentTimeOfDay(): TimeOfDay {
    const hour = new Date().getHours();
    
    if (hour >= this.timeOfDayThresholds.morning.start && hour < this.timeOfDayThresholds.morning.end) {
      return 'morning';
    } else if (hour >= this.timeOfDayThresholds.afternoon.start && hour < this.timeOfDayThresholds.afternoon.end) {
      return 'afternoon';
    } else if (hour >= this.timeOfDayThresholds.evening.start && hour < this.timeOfDayThresholds.evening.end) {
      return 'evening';
    } else {
      return 'night';
    }
  }

  /**
   * Calculate the required number of vehicles based on time of day and historical data
   */
  calculateRequiredVehicles(
    timeOfDay: TimeOfDay,
    historicalData: {
      averageRiders: number;
      averageVehicleCapacity: number;
      historicalDemandFactor: number;
    }
  ): number {
    // Base number of vehicles needed
    const baseVehicles = Math.ceil(
      (historicalData.averageRiders * historicalData.historicalDemandFactor) / 
      historicalData.averageVehicleCapacity
    );

    // Adjust based on time of day
    const timeFactors = {
      morning: 1.5,    // Higher demand in morning
      afternoon: 1.0,  // Normal demand in afternoon
      evening: 1.3,    // Increased demand in evening
      night: 0.5       // Reduced demand at night
    };

    return Math.ceil(baseVehicles * timeFactors[timeOfDay]);
  }

  /**
   * Generate a dynamic schedule based on current conditions
   */
  generateSchedule(config: ScheduleConfig): VehicleAllocation[] {
    const currentTimeOfDay = this.getCurrentTimeOfDay();
    const requiredVehicles = this.calculateRequiredVehicles(
      currentTimeOfDay,
      {
        averageRiders: config.averageRiders,
        averageVehicleCapacity: config.averageVehicleCapacity,
        historicalDemandFactor: config.historicalDemandFactor
      }
    );

    // Distribute vehicles across routes based on demand
    return config.routes.map(route => ({
      routeId: route.id,
      allocatedVehicles: Math.max(
        1, // Always at least one vehicle per route
        Math.floor(requiredVehicles * (route.demandFactor || 1))
      ),
      timeOfDay: currentTimeOfDay,
      lastUpdated: new Date().toISOString()
    }));
  }

  /**
   * Adjust vehicle allocation based on real-time demand
   */
  adjustForRealTimeDemand(
    currentAllocation: VehicleAllocation[],
    realTimeData: {
      routeId: string;
      currentLoad: number;
      waitingPassengers: number;
      averageWaitTime: number;
    }[]
  ): VehicleAllocation[] {
    return currentAllocation.map(allocation => {
      const routeData = realTimeData.find(r => r.routeId === allocation.routeId);
      if (!routeData) return allocation;

      // Calculate adjustment factor based on real-time data
      let adjustmentFactor = 1;
      
      // Increase allocation if there are waiting passengers
      if (routeData.waitingPassengers > 10) {
        adjustmentFactor += 0.5;
      }
      
      // Increase allocation if average wait time is high
      if (routeData.averageWaitTime > 10) { // More than 10 minutes
        adjustmentFactor += 0.3;
      }
      
      // Decrease allocation if vehicles are underutilized
      if (routeData.currentLoad < 0.3) { // Less than 30% capacity
        adjustmentFactor = Math.max(0.5, adjustmentFactor - 0.2);
      }

      return {
        ...allocation,
        allocatedVehicles: Math.max(
          1,
          Math.ceil(allocation.allocatedVehicles * adjustmentFactor)
        ),
        lastUpdated: new Date().toISOString()
      };
    });
  }
}

export const schedulingService = new SchedulingService();
