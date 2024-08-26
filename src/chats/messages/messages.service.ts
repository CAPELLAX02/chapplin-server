import { Inject, Injectable } from '@nestjs/common';
import { ChatsRepository } from '../chats.repository';
import { CreateMessageInput } from './dto/create-message.input';
import { Message } from './entities/message.entity';
import { Types } from 'mongoose';
import { GetMessagesArgs } from './dto/get-messages.args';
import { PUB_SUB } from 'src/common/constants/injection-tokens';
import { PubSub } from 'graphql-subscriptions';
import { MESSAGE_CREATED } from './constants/pubsub-triggers';
import { MessageCreatedArgs } from './dto/message-created.args';
import { ChatsService } from '../chats.service';

@Injectable()
export class MessagesService {
  constructor(
    private readonly chatsRepository: ChatsRepository,
    private readonly chatsService: ChatsService,
    @Inject(PUB_SUB) private readonly pubSub: PubSub,
  ) {}

  /**
   * Creates a new message and adds it to the specified chat.
   *
   * This method creates a message object using the input data and the user's ID,
   * then adds the new message to the corresponding chat document in the database.
   * The method also ensures that the message is only added to chats where the user
   * is a participant.
   *
   * @param {CreateMessageInput} createMessageInput - The input data for creating a message, including content and chatId.
   * @param {string} userId - The ID of the user creating the message.
   * @returns {Promise<Message>} The created message object, including the content, userId, chatId, createdAt timestamp, and unique message ID.
   * @throws {Error} Throws an error if the chat is not found or the user is not a participant.
   */
  async createMessage(
    { content, chatId }: CreateMessageInput,
    userId: string,
  ): Promise<Message> {
    // Create a new message object with provided content, chatId, and userId
    const message: Message = {
      content,
      userId,
      chatId,
      createdAt: new Date(), // Set the message creation timestamp
      _id: new Types.ObjectId(), // Generate a new unique ObjectId for the message
    };

    // Find the chat by ID and ensure the user is a participant, then push the new message to the messages array
    await this.chatsRepository.findOneAndUpdate(
      {
        _id: chatId,
        ...this.chatsService.userChatFilter(userId), // Apply filter to ensure user is part of the chat
      },
      {
        $push: {
          messages: message, // Add the new message to the chat's messages array
        },
      },
    );

    await this.pubSub.publish(MESSAGE_CREATED, {
      messageCreated: message,
    });

    // Return the newly created message object
    return message;
  }

  /**
   * Retrieves messages from a specific chat that the user is a part of.
   *
   * This method finds the chat by ID and checks if the user is a participant.
   * It then returns all messages associated with that chat. The function ensures
   * security by filtering out chats that the user is not authorized to access.
   *
   * @param {GetMessagesArgs} getMessagesArgs - The arguments to filter messages, including the chatId.
   * @param {string} userId - The ID of the user requesting the messages.
   * @returns {Promise<Message[]>} A list of messages from the specified chat, or an empty list if no messages are found or the user is unauthorized.
   * @throws {Error} Throws an error if the chat is not found or the user is not a participant.
   */
  async getMessages(
    { chatId }: GetMessagesArgs,
    userId: string,
  ): Promise<Message[]> {
    // Find the chat by ID and apply a filter to ensure the user is authorized
    const chat = await this.chatsRepository.findOne({
      _id: chatId,
      ...this.chatsService.userChatFilter(userId),
    });

    // Return the list of messages from the chat, or an empty array if no messages exist
    return chat ? chat.messages : [];
  }

  /**
   *
   */
  async messageCreated({ chatId }: MessageCreatedArgs, userId: string) {
    await this.chatsRepository.findOne({
      _id: chatId,
      ...this.chatsService.userChatFilter(userId),
    });
    return this.pubSub.asyncIterator(MESSAGE_CREATED);
  }
}
