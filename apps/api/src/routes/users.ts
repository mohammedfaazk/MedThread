import { Router } from 'express';
import { prisma } from '@medthread/database';

export const userRouter = Router();

userRouter.get('/:id', async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
    select: {
      id: true,
      username: true,
      role: true,
      verificationStatus: true,
      reputationScore: true,
      createdAt: true
    }
  });
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  res.json(user);
});

export default userRouter;
