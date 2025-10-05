import { PrismaClient } from '@prisma/client';

class DatabaseService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient({
      log: ['query', 'info', 'warn', 'error'],
    });
  }

  // User operations
  async createUser(userData: {
    email: string;
    name: string;
    password: string;
    avatar?: string;
  }) {
    return await this.prisma.user.create({
      data: userData,
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        createdAt: true,
      },
    });
  }

  async findUserByEmail(email: string) {
    return await this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findUserById(id: string) {
    return await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        createdAt: true,
      },
    });
  }

  // Document operations
  async createDocument(documentData: {
    title: string;
    filename: string;
    originalName: string;
    filePath: string;
    fileSize: number;
    mimeType: string;
    userId: string;
    status?: string;
    extractedText?: string;
    summary?: string;
    metadata?: any;
  }) {
    return await this.prisma.document.create({
      data: documentData,
    });
  }

  async updateDocument(id: string, updateData: {
    status?: string;
    extractedText?: string;
    summary?: string;
    metadata?: any;
  }) {
    return await this.prisma.document.update({
      where: { id },
      data: updateData,
    });
  }

  async getDocumentsByUserId(userId: string) {
    return await this.prisma.document.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getDocumentById(id: string) {
    return await this.prisma.document.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async deleteDocument(id: string) {
    return await this.prisma.document.delete({
      where: { id },
    });
  }

  // Chat session operations
  async createChatSession(sessionData: {
    title?: string;
    userId: string;
    documentId: string;
  }) {
    return await this.prisma.chatSession.create({
      data: sessionData,
    });
  }

  async getChatSessionsByUserId(userId: string) {
    return await this.prisma.chatSession.findMany({
      where: { userId },
      include: {
        document: {
          select: {
            id: true,
            title: true,
            filename: true,
          },
        },
        messages: {
          orderBy: { timestamp: 'asc' },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async getChatSessionById(id: string) {
    return await this.prisma.chatSession.findUnique({
      where: { id },
      include: {
        document: true,
        messages: {
          orderBy: { timestamp: 'asc' },
        },
      },
    });
  }

  async addMessage(messageData: {
    content: string;
    role: string;
    sessionId: string;
  }) {
    return await this.prisma.message.create({
      data: messageData,
    });
  }

  async getMessagesBySessionId(sessionId: string) {
    return await this.prisma.message.findMany({
      where: { sessionId },
      orderBy: { timestamp: 'asc' },
    });
  }

  async updateChatSession(id: string, updateData: {
    title?: string;
  }) {
    return await this.prisma.chatSession.update({
      where: { id },
      data: updateData,
    });
  }

  async deleteChatSession(id: string) {
    return await this.prisma.chatSession.delete({
      where: { id },
    });
  }

  // Team operations
  async createTeam(teamData: {
    name: string;
    description?: string;
    creatorId: string;
  }) {
    return await this.prisma.team.create({
      data: teamData,
    });
  }

  async addTeamMember(teamMemberData: {
    userId: string;
    teamId: string;
    role: string;
  }) {
    return await this.prisma.teamMember.create({
      data: teamMemberData,
    });
  }

  async getTeamsByUserId(userId: string) {
    return await this.prisma.team.findMany({
      where: {
        OR: [
          { creatorId: userId },
          { members: { some: { userId } } },
        ],
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });
  }

  // Statistics
  async getUserStats(userId: string) {
    const [documentCount, chatSessionCount, messageCount] = await Promise.all([
      this.prisma.document.count({ where: { userId } }),
      this.prisma.chatSession.count({ where: { userId } }),
      this.prisma.message.count({
        where: {
          session: { userId },
        },
      }),
    ]);

    return {
      documentCount,
      chatSessionCount,
      messageCount,
    };
  }

  async disconnect() {
    await this.prisma.$disconnect();
  }
}

export default new DatabaseService();
