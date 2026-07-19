import { Request, Response, NextFunction } from 'express';
import clinicModel from '../models/clinic.model.js';
import { LabModel } from '../models/lab.model.js';
import subscriptionPlanModel from '../models/subscriptionPlan.model.js';

export const requireFeature = (featureName: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;
      if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      let entityId = user.clinicId || user.id; // For doctors/staff, it usually maps back to clinicId
      if (user.role === "lab") entityId = user.id;

      let entityObj: any = null;
      if (user.role === "lab") {
        entityObj = await LabModel.findById(entityId).populate("subscriptionPlan");
      } else {
        entityObj = await clinicModel.findById(entityId).populate("subscriptionPlan");
      }

      if (!entityObj) {
        return res.status(404).json({ message: 'Entity not found' });
      }

      // We ensure the Subscription Plan model is registered
      const plan = entityObj.subscriptionPlan;

      // Check if they are admin/superadmin who bypasses rules (optional)
      if (user.role === "superadmin") return next();

      // If they have no plan, or their plan doesn't include the feature
      if (!plan || !plan.features || !plan.features.includes(featureName)) {
        return res.status(403).json({ 
          success: false,
          error: "SubscriptionUpgradeRequired",
          message: `Your current subscription does not include access to ${featureName}. Please upgrade to Enterprise.`
        });
      }

      next();
    } catch (error) {
      console.error("requireFeature Middleware Error:", error);
      return res.status(500).json({ message: 'Server error while checking features' });
    }
  };
};
