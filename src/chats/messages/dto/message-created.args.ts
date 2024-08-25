import { ArgsType, Field } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';

@ArgsType()
export class MessageCreatedArgs {
  /**
   * The ID of the chat for which messages are being subscribed.
   * This field is required.
   */
  @Field()
  @IsNotEmpty()
  chatId: string;
}
