import { User } from "@/models";
import type { Role } from "@/types";

export async function findUserByEmail(email: string, options?: { withPasswordFields?: boolean }) {
  let q = User.findOne({ email, deletedAt: { $exists: false } });
  if (options?.withPasswordFields) {
    q = q.select("+passwordHash +resetPasswordToken +resetPasswordExpires");
  }
  return q.exec();
}

export async function findUserByFirebaseUid(uid: string) {
  return User.findOne({ firebaseUid: uid, deletedAt: { $exists: false } }).exec();
}

export async function createPasswordUser(input: { email: string; passwordHash: string; name: string; role?: Role }) {
  const role = input.role ?? "patient";
  return User.create({
    email: input.email,
    passwordHash: input.passwordHash,
    name: input.name,
    role,
  });
}

export async function upsertFirebaseUser(input: {
  firebaseUid: string;
  email?: string;
  phone?: string;
  name?: string;
  /** Only applied when creating a new user */
  defaultRole?: Role;
}) {
  const existingByUid = await findUserByFirebaseUid(input.firebaseUid);
  if (existingByUid) {
    return User.findByIdAndUpdate(
      existingByUid._id,
      {
        $set: {
          ...(input.email && { email: input.email }),
          ...(input.phone && { phone: input.phone }),
          ...(input.name && { name: input.name }),
        },
      },
      { new: true }
    );
  }

  if (input.email) {
    const linked = await User.findOneAndUpdate(
      { email: input.email },
      {
        $set: {
          firebaseUid: input.firebaseUid,
          ...(input.phone && { phone: input.phone }),
          ...(input.name && { name: input.name }),
        },
      },
      { new: true }
    );
    if (linked) return linked;
  }

  const email =
    input.email ??
    `${input.firebaseUid}@phone.smilesync.local`;

  return User.create({
    firebaseUid: input.firebaseUid,
    email,
    name: input.name ?? "SmileSync Patient",
    phone: input.phone,
    role: input.defaultRole ?? "patient",
  });
}

export async function setPasswordResetFields(email: string, tokenHash: string, expires: Date) {
  return User.findOneAndUpdate(
    { email, deletedAt: { $exists: false } },
    { $set: { resetPasswordToken: tokenHash, resetPasswordExpires: expires } },
    { new: true }
  ).exec();
}

export async function findUserForReset(email: string, tokenHash: string) {
  return User.findOne({
    email,
    resetPasswordToken: tokenHash,
    resetPasswordExpires: { $gt: new Date() },
    deletedAt: { $exists: false },
  })
    .select("+passwordHash +resetPasswordToken +resetPasswordExpires")
    .exec();
}

export async function clearPasswordResetFields(userId: string) {
  return User.findByIdAndUpdate(userId, {
    $unset: { resetPasswordToken: 1, resetPasswordExpires: 1 },
  }).exec();
}

export async function updatePasswordHash(userId: string, passwordHash: string) {
  return User.findByIdAndUpdate(userId, { $set: { passwordHash } }).exec();
}
