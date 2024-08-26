import { Injectable } from '@nestjs/common';
import { CreateChatInput } from './dto/create-chat.input';
import { UpdateChatInput } from './dto/update-chat.input';
import { ChatsRepository } from './chats.repository';

@Injectable()
export class ChatsService {
  constructor(private readonly chatsRepository: ChatsRepository) {}

  /**
   * Creates a new chat with the specified input and user ID.
   *
   * @param {CreateChatInput} createChatInput - The input data for creating a chat.
   * @param {string} userId - The ID of the user creating the chat.
   * @returns {Promise<any>} The newly created chat document.
   */
  async create(createChatInput: CreateChatInput, userId: string): Promise<any> {
    return this.chatsRepository.create({
      ...createChatInput,
      userId,
      userIds: createChatInput.userIds || [],
      messages: [],
    });
  }

  /**
   * Retrieves all chats from the repository.
   *
   * @returns {Promise<any[]>} A list of all chat documents.
   */
  async findAll(userId: string): Promise<any[]> {
    return this.chatsRepository.find({
      ...this.userChatFilter(userId),
    });
  }

  /**
   * Finds a single chat by its ID.
   *
   * @param {string} _id - The ID of the chat to find.
   * @returns {Promise<any>} The chat document if found, otherwise null.
   */
  async findOne(_id: string): Promise<any> {
    return this.chatsRepository.findOne({ _id });
  }

  /**
   * Updates a chat with the specified ID using the provided input.
   *
   * @param {number} id - The ID of the chat to update.
   * @param {UpdateChatInput} updateChatInput - The input data for updating the chat.
   * @returns {string} A message indicating the result of the update operation.
   */
  update(id: number, updateChatInput: UpdateChatInput): string {
    return `This action updates a #${id} chat`;
  }

  /**
   * Removes a chat with the specified ID.
   *
   * @param {number} id - The ID of the chat to remove.
   * @returns {string} A message indicating the result of the remove operation.
   */
  remove(id: number): string {
    return `This action removes a #${id} chat`;
  }

  /**
   * Generates a MongoDB filter object for querying chats involving the specified user.
   *
   * This utility function creates a filter to find chats where the given user is either
   * a direct participant (userId matches) or part of a group chat (userId included in userIds array).
   *
   * @param {string} userId - The ID of the user.
   * @returns {object} The filter object for querying the chats collection.
   */
  userChatFilter(userId: string): object {
    return {
      $or: [
        { userId }, // Direct chats where the user is the primary participant
        {
          userIds: {
            $in: [userId], // Group chats where the user is one of the participants
          },
        },
        { isPrivate: false },
      ],
    };
  }
}
