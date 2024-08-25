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
   * This mutation allows an authenticated user to create a new message in a specific chat. The message data is provided through the `createMessageInput` parameter, which includes the message content and the target chat ID. The user's ID is retrieved from the authentication token payload.
   *
   * @param {CreateMessageInput} createMessageInput - The input data for creating a message, including content and chatId.
   * @param {TokenPayload} user - The current authenticated user's token payload containing user details.
   * @returns {Promise<Message>} The created message with all relevant details such as content, userId, chatId, and createdAt timestamp.
   * @throws {Error} Throws an error if the message creation fails or if the user is not authorized.
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
   * This query retrieves all messages from a specified chat that the authenticated user is a part of.
   * The chat is identified using the `chatId` provided in the `getMessageArgs`, and the user's
   * authorization is verified using their token payload.
   *
   * @param {GetMessagesArgs} getMessageArgs - The arguments to filter messages, including the chatId.
   * @param {TokenPayload} user - The current authenticated user's token payload used to verify their participation in the chat.
   * @returns {Promise<Message[]>} The list of messages retrieved from the specified chat. Returns an empty array if no messages are found or the user is unauthorized.
   * @throws {Error} Throws an error if the chat is not found or the user is not a participant.
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
   * Subscription to listen for new messages in a chat.
   *
   * @param {MessageCreatedArgs} _messageCreatedArgs - The arguments to filter messages for subscription.
   * @returns {AsyncIterator<Message>} An async iterator that listens for new messages.
   */
  @Subscription(() => Message, {
    filter: (payload, variables) => {
      // Filter messages to only emit those that belong to the specified chat
      return payload.messageCreated.chatId === variables.chatId;
    },
  })
  messageCreated(@Args() _messageCreatedArgs: MessageCreatedArgs) {
    // User the PubSub system to subscribe to the MESSAGE_CREATED trigger
    return this.pubSub.asyncIterator(MESSAGE_CREATED);
  }
}
