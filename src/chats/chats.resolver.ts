import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { ChatsService } from './chats.service';
import { Chat } from './entities/chat.entity';
import { CreateChatInput } from './dto/create-chat.input';
import { UpdateChatInput } from './dto/update-chat.input';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from 'src/auth/guards/gql-auth.guard';
import { CurrentUser } from 'src/auth/current-user-decorator';
import { TokenPayload } from 'src/auth/token-payload.interface';

@Resolver(() => Chat)
export class ChatsResolver {
  constructor(private readonly chatsService: ChatsService) {}

  /**
   * Mutation to create a new chat.
   *
   * Allows an authenticated user to create a new chat by providing the necessary input data.
   *
   * @param {CreateChatInput} createChatInput - The input data required to create a new chat.
   * @param {TokenPayload} user - The current authenticated user's token payload.
   * @returns {Promise<Chat>} The newly created chat entity.
   */
  @UseGuards(GqlAuthGuard)
  @Mutation(() => Chat)
  createChat(
    @Args('createChatInput') createChatInput: CreateChatInput,
    @CurrentUser() user: TokenPayload,
  ) {
    return this.chatsService.create(createChatInput, user._id);
  }

  /**
   * Query to retrieve all chats for the authenticated user.
   *
   * Fetches all chats that the current authenticated user is a part of.
   *
   * @param {TokenPayload} user - The current authenticated user's token payload.
   * @returns {Promise<Chat[]>} A list of chats the user is involved in.
   */
  @UseGuards(GqlAuthGuard)
  @Query(() => [Chat], { name: 'chats' })
  findAll(@CurrentUser() user: TokenPayload) {
    return this.chatsService.findAll(user._id);
  }

  /**
   * Query to find a specific chat by its ID.
   *
   * Retrieves a single chat entity based on the provided chat ID.
   *
   * @param {string} _id - The ID of the chat to retrieve.
   * @returns {Promise<Chat>} The chat entity if found, otherwise null.
   */
  @Query(() => Chat, { name: 'chat' })
  findOne(@Args('_id') _id: string) {
    return this.chatsService.findOne(_id);
  }

  /**
   * Mutation to update an existing chat.
   *
   * Updates a chat's details based on the provided input data.
   *
   * @param {UpdateChatInput} updateChatInput - The input data for updating the chat.
   * @returns {Promise<Chat>} The updated chat entity.
   */
  @Mutation(() => Chat)
  updateChat(@Args('updateChatInput') updateChatInput: UpdateChatInput) {
    return this.chatsService.update(updateChatInput.id, updateChatInput);
  }

  /**
   * Mutation to remove a chat by its ID.
   *
   * Deletes a chat based on the provided chat ID.
   *
   * @param {number} id - The ID of the chat to remove.
   * @returns {Promise<Chat>} A message indicating the result of the removal operation.
   */
  @Mutation(() => Chat)
  removeChat(@Args('id', { type: () => Int }) id: number) {
    return this.chatsService.remove(id);
  }
}
