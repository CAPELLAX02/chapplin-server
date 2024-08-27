import { ObjectType, Field, Int } from '@nestjs/graphql';
import { AbstractEntity } from 'src/common/database/abstract.entity';
import { Message } from '../messages/entities/message.entity';

@ObjectType()
export class Chat extends AbstractEntity {
  @Field()
  name?: string;

  @Field(() => Message, { nullable: true })
  latestMessage?: Message;
}
