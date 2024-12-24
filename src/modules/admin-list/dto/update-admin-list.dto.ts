import { PartialType } from '@nestjs/swagger';
import { CreateAdminListDto } from './create-admin-list.dto';

export class UpdateAdminListDto extends PartialType(CreateAdminListDto) {}
