import { LoginUserDTO } from '@app/database/dtos/userDtos/loginUser.dto';
import { UpdateUserRequestDTO } from '@app/database/dtos/userDtos/updateUserRequest.dto';
import { UserDTO } from '@app/database/dtos/userDtos/user.dto';
import { User } from '@app/database/entities/user.entity';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository, QueryFailedError } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly entityManager: EntityManager,
  ) {}

  /**
   * Creates a new user in the database.
   * @param data The data for the new user.
   * @returns The created UserDTO.
   * @throws BadRequestException If the provided data is invalid or email already exists.
   */
  async createUser(data: UserDTO) {
    try {
      const userDto = new UserDTO(data);
      userDto.password = await bcrypt.hash(userDto.password, 10);
      const user = new User(userDto);
      await this.entityManager.save(user);
      return userDto;
    } catch (error) {
      if (error instanceof QueryFailedError) {
        const errorCode = (error as any).code;

        if (errorCode === 'ER_DUP_ENTRY') {
          throw new BadRequestException('Email already exists.');
        }
      }

      throw new BadRequestException(
        'Invalid user data. Please provide all required fields.',
      );
    }
  }

  /**
   * Retrieves all users from the database.
   * @returns An array of UserDTOs.
   * @throws InternalServerErrorException If there's an error during retrieval.
   */
  async getAllUsers(): Promise<UserDTO[]> {
    try {
      const users = await this.userRepository.find();

      if (!users) {
        throw new InternalServerErrorException('No users found');
      }

      const userDtos: UserDTO[] = users.map((user: User) => {
        const userDto = new UserDTO(user);
        return userDto;
      });

      return userDtos;
    } catch (error) {
      console.error('Error while finding users:', error);

      throw new InternalServerErrorException('Error while finding users');
    }
  }

  /**
   * Retrieves a single user by their ID.
   * @param id The ID of the user to retrieve.
   * @returns The UserDTO of the retrieved user.
   * @throws BadRequestException If the ID is invalid.
   * @throws NotFoundException If the user is not found.
   */
  async getUser(id: number): Promise<UserDTO> {
    try {
      if (isNaN(id) || id <= 0) {
        throw new BadRequestException('Invalid user ID');
      }

      const user = await this.userRepository.findOne({ where: { id } });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      return new UserDTO(user);
    } catch (error) {
      console.error('Error while finding user:', error);

      throw new InternalServerErrorException('Error while finding user');
    }
  }

  /**
   * Updates a user's information in the database.
   * @param updateUserDto The DTO containing the user's updated information.
   * @returns The updated UserDTO or null if not updated.
   * @throws BadRequestException If the provided ID is invalid.
   * @throws NotFoundException If the user is not found.
   */
  async updateUser(
    updateUserDto: UpdateUserRequestDTO,
  ): Promise<UserDTO | null> {
    try {
      if (isNaN(updateUserDto.id) || updateUserDto.id <= 0) {
        throw new BadRequestException('Invalid user ID');
      }

      const updatedUser = await this.entityManager.transaction(
        async (transactionalEntityManager) => {
          const user = await this.userRepository.findOne({
            where: { id: updateUserDto.id },
          });

          if (!user) {
            throw new NotFoundException('User not found');
          }

          // Updating user fields if provided
          if (updateUserDto.data.email && updateUserDto.data.email.length > 0) {
            user.email = updateUserDto.data.email;
          }
          if (
            updateUserDto.data.password &&
            updateUserDto.data.password.length > 0
          ) {
            user.password = updateUserDto.data.password;
          }
          if (updateUserDto.data.name && updateUserDto.data.name.length > 0) {
            user.name = updateUserDto.data.name;
          }

          await transactionalEntityManager.save(user);

          return new UserDTO(user);
        },
      );

      return updatedUser;
    } catch (error) {
      console.error('Error while updating user:', error);

      throw new InternalServerErrorException(
        'Error while updating user: ' + error.message,
      );
    }
  }

  /**
   * Deletes a user from the database.
   * @param id The ID of the user to delete.
   * @returns A boolean indicating whether the deletion was successful.
   * @throws NotFoundException If the user is not found.
   * @throws InternalServerErrorException If there's an error during deletion.
   */
  async deleteUser(id: number): Promise<boolean> {
    try {
      const result = await this.userRepository.delete(id);

      if (result.affected && result.affected > 0) {
        return true;
      } else {
        throw new NotFoundException('User not found');
      }
    } catch (error) {
      console.error('Error while deleting user:', error);

      throw new InternalServerErrorException(
        'Error while deleting user: ' + error.message,
      );
    }
  }

  /**
   * Login a user by comparing the provided credentials with stored user data.
   * @param loginUserDto An object containing the email and password for login.
   * @returns A UserDTO representing the authenticated user.
   * @throws NotFoundException If the user is not found.
   * @throws InternalServerErrorException If there's an error during login.
   */
  async loginUser(loginUserDto: LoginUserDTO): Promise<UserDTO> {
    try {
      const user = await this.userRepository.findOne({
        where: { email: loginUserDto.email },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const passwordMatchResult = await bcrypt.compare(
        loginUserDto.password,
        user.password,
      );

      if (passwordMatchResult) {
        return new UserDTO(user);
      } else {
        throw new InternalServerErrorException('Wrong password');
      }
    } catch (error) {
      console.error('Error during login:', error);

      throw new InternalServerErrorException(
        'Error during login: ' + error.message,
      );
    }
  }
}
