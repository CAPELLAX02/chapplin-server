import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema } from '@nestjs/mongoose';
import { AbstractEntity } from 'src/common/database/abstract.entity';

@ObjectType()
@Schema()
export class Message extends AbstractEntity {
  /**
   * The content of the message.
   */
  @Field()
  @Prop()
  content: string;

  /**
   * The date and time when the message was created.
   */
  @Field()
  @Prop()
  createdAt: Date;

  /**
   * The ID of the user who sent the message.
   */
  @Field()
  @Prop()
  userId: string;

  /**
   * The ID of the chat where the message was sent.
   */
  @Field()
  @Prop()
  chatId: string;
}
