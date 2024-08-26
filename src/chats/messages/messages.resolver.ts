import { Args, Mutation, Resolver, Query, Subscription } from '@nestjs/graphql';
import { MessagesService } from './messages.service';
import { Message } from './entities/message.entity';
import { Inject, UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from 'src/auth/guards/gql-auth.guard';
import { CreateMessageInput } from './dto/create-message.input';
import { CurrentUser } from 'src/auth/current-user-decorator';
import { TokenPayload } from 'src/auth/token-payload.interface';
import { GetMessagesArgs } from './dto/get-messages.args';
import { PUB_SUB } from 'src/common/constants/injection-tokens';
import { PubSub } from 'graphql-subscriptions';
import { MESSAGE_CREATED } from './constants/pubsub-triggers';
import { MessageCreatedArgs } from './dto/message-created.args';

@Resolver(() => Message)
export class MessagesResolver {
  constructor(
    private readonly messagesService: MessagesService,
    @Inject(PUB_SUB) private readonly pubSub: PubSub,
  ) {}

  /**
   * Mutation to create a new message in a chat.
   *
   * Allows an authenticated user to create a new message in a specific chat.
   * The message content and target chat ID are provided as input, and the user's ID is extracted from the authentication token.
   *
   * @param {CreateMessageInput} createMessageInput - The input data for creating a message, including content and chatId.
   * @param {TokenPayload} user - The current authenticated user's token payload.
   * @returns {Promise<Message>} The created message.
   */
  @Mutation(() => Message)
  @UseGuards(GqlAuthGuard)
  async createMessage(
    @Args('createMessageInput') createMessageInput: CreateMessageInput,
    @CurrentUser() user: TokenPayload,
  ) {
    // Delegate the message creation to the service layer
    return this.messagesService.createMessage(createMessageInput, user._id);
  }

  /**
   * Query to fetch messages for a specific chat.
   *
   * Retrieves all messages from a chat that the authenticated user is a part of.
   *
   * @param {GetMessagesArgs} getMessageArgs - Arguments to filter messages, including chatId.
   * @param {TokenPayload} user - The current authenticated user's token payload.
   * @returns {Promise<Message[]>} List of messages from the specified chat.
   */
  @Query(() => [Message], { name: 'messages' })
  @UseGuards(GqlAuthGuard)
  async getMessages(
    @Args() getMessageArgs: GetMessagesArgs,
    @CurrentUser() user: TokenPayload,
  ) {
    // Delegate the retrieval of messages to the service layer
    return this.messagesService.getMessages(getMessageArgs, user._id);
  }

  /**
   * Subscription to notify when a new message is created in a chat.
   *
   * This subscription triggers when a new message is created in a chat that the authenticated user is a part of.
   * The subscription includes a filter to ensure that the authenticated user receives notifications only for
   * messages in the specified chat, and not for messages they themselves created.
   *
   * @param {MessageCreatedArgs} messageCreatedArgs - The arguments required for the message creation subscription, including chatId.
   * @param {TokenPayload} user - The current authenticated user's token payload.
   * @returns {AsyncIterator<Message>} An asynchronous iterator that pushes the newly created message to the client if the conditions are met.
   */
  @Subscription(() => Message, {
    filter: (payload, variables, context) => {
      const userId = context.req.user._id;
      return (
        payload.messageCreated.chatId === variables.chatId &&
        userId !== payload.messageCreated.userId
      );
    },
  })
  messageCreated(
    @Args() messageCreatedArgs: MessageCreatedArgs,
    @CurrentUser() user: TokenPayload,
  ) {
    return this.messagesService.messageCreated(messageCreatedArgs, user._id);
  }
}
