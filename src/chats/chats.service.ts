import { Injectable } from '@nestjs/common';
import { CreateChatInput } from './dto/create-chat.input';
import { UpdateChatInput } from './dto/update-chat.input';
import { ChatsRepository } from './chats.repository';

@Injectable()
export class ChatsService {
  constructor(private readonly chatsRepository: ChatsRepository) {}

  async create(createChatInput: CreateChatInput, userId: string) {
    return this.chatsRepository.create({
      ...createChatInput,
      userId,
      messages: [],
    });
  }

  async findAll() {
    return this.chatsRepository.find({
      ...this.chatsRepository.find({}),
    });
  }

  async findOne(_id: string) {
    return this.chatsRepository.findOne({ _id });
  }

  update(id: number, updateChatInput: UpdateChatInput): string {
    return `This action updates a #${id} chat`;
  }

  remove(id: number): string {
    return `This action removes a #${id} chat`;
  }
}
