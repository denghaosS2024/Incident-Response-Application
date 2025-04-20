import { Request, Response, Router } from "express";
import { Types } from "mongoose";
import ProfileController from "../controllers/ProfileController";

const profileRouter = Router();

/**
 * Get a user's profile by userId
 * @route GET /api/profile/:userId
 */
profileRouter.get("/:userId", async (req: Request, res: Response) => {
  try {
    const userId = new Types.ObjectId(req.params.userId);
    const profile = await ProfileController.getProfile(userId);
    res.status(200).json(profile);
  } catch (e) {
    res.status(404).json({ message: (e as Error).message });
  }
});

/**
 * Create or update a profile
 * @route PUT /api/profiles/:userId
 */
profileRouter.put("/:userId", async (req, res) => {
  try {
    const userId = new Types.ObjectId(req.params.userId);
    const updatedProfile = await ProfileController.upsertProfile(
      userId,
      req.body,
    );
    res.status(200).json(updatedProfile);
  } catch (e) {
    res.status(400).json({ message: (e as Error).message });
  }
});

/**
 * Delete a profile
 * @route DELETE /api/profile/:userId
 */
profileRouter.delete("/:userId", async (req: Request, res: Response) => {
  try {
    const userId = new Types.ObjectId(req.params.userId);
    const response = await ProfileController.deleteProfile(userId);
    res.status(200).json(response);
  } catch (e) {
    res.status(404).json({ message: (e as Error).message });
  }
});

export default profileRouter;
