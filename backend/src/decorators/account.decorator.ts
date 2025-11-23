import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { AccountDTO } from '@resources';

export const DAccount = createParamDecorator((_, context: ExecutionContext) => {
  const { account } = context.switchToHttp().getRequest();

  return account as Partial<AccountDTO>;
});
