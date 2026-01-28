import { Moderation } from './moderation/moderation.module.ts';
import { Verification } from './verification/verify.module.ts';

export const modulos = [new Moderation(), new Verification()];
