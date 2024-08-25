import { ArgsType, Field } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';

@ArgsType()
export class GetMessagesArgs {
  /**
   * The ID of the chat for which messages are being requested.
   */
  @Field()
  @IsNotEmpty()
  chatId: string;
}
