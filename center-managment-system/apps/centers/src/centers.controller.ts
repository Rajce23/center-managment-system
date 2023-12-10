import { Controller } from '@nestjs/common';
import { CentersService } from './centers.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CENTER_MESSAGES } from '@app/rmq/rmq.center.constants';
import { CreateCenterDto } from '@app/database/dtos/centerDtos/createCenter.dto';
import { UpdateCenterDto } from '@app/database/dtos/centerDtos/updateCenter.dto';
import { Center } from '@app/database/entities/center.entity';

@Controller()
export class CentersController {
  constructor(private readonly centersService: CentersService) {}

  // Create a new center
  @MessagePattern(CENTER_MESSAGES.createCenter)
  async createCenter(@Payload() data: CreateCenterDto): Promise<Center> {
    return this.centersService.createCenter(data);
  }

  // Get a list of all centers
  @MessagePattern(CENTER_MESSAGES.getAllCenters)
  async getAllCenters(): Promise<Center[]> {
    return this.centersService.getCenters();
  }

  // Get a center by its ID
  @MessagePattern(CENTER_MESSAGES.getCenter)
  async getCenter(@Payload() id: number): Promise<Center> {
    return this.centersService.getCenter(id);
  }

  // Delete a center by its ID
  @MessagePattern(CENTER_MESSAGES.deleteCenter)
  async deleteCenter(@Payload() id: number): Promise<boolean> {
    return this.centersService.deleteCenter(id);
  }

  // Update a center's information
  @MessagePattern(CENTER_MESSAGES.updateCenter)
  async updateCenter(
    @Payload() UpdateCenterDto: UpdateCenterDto,
  ): Promise<UpdateCenterDto> {
    return this.centersService.updateCenter(UpdateCenterDto);
  }

  // Get a center by its associated front ID
  @MessagePattern(CENTER_MESSAGES.getCeterWithFrontId)
  async getCenterForTask(
    @Payload() frontIdDto: { frontId: number },
  ): Promise<any> {
    return this.centersService.getCenterForTasks(frontIdDto);
  }
}
