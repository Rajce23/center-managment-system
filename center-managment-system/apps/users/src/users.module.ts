import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { DatabaseModule } from '@app/database';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@app/database/entities/user.entity';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { USER_QUEUE } from '@app/rmq';
import { TASK_QUEUE } from '@app/rmq/rmq.task.constants';

@Module({
  imports: [
    DatabaseModule,
    TypeOrmModule.forFeature([User]),
    ClientsModule.register([
      {
        name: USER_QUEUE.serviceName,
        transport: Transport.RMQ,
        options: {
          urls: [USER_QUEUE.url],
          queue: USER_QUEUE.queueName,
          queueOptions: {
            durable: false,
          },
        },
      },
      {
        name: TASK_QUEUE.serviceName,
        transport: Transport.RMQ,
        options: {
          urls: [TASK_QUEUE.url],
          queue: TASK_QUEUE.queueName,
          queueOptions: {
            durable: false,
          },
        },
      },
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
