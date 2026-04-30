import { Module } from '@nestjs/common';
import { MovementsController } from './movements.controller';
import { MovementsService } from './movements.service';

@Module({
  controllers: [MovementsController],
  providers: [MovementsService],
})
export class MovementsModule {}
