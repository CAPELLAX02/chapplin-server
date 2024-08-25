import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';

@InputType()
export class CreateMessageInput {
  /**
   * The content of the message to be created.
   */
  @Field()
  @IsNotEmpty()
  content: string;

  /**
   * The ID of the chat where the message will be created.
   */
  @Field()
  @IsNotEmpty()
  chatId: string;
}
