import { Module, OnModuleInit } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Role } from './roles.model';
import { User } from 'src/modules/users/users.model';
import { UserRoles } from './user-roles.model';

@Module({
    providers: [RolesService],
    controllers: [RolesController],
    imports: [
        SequelizeModule.forFeature([Role, User, UserRoles])
      ],
    exports: [RolesService]
})
export class RolesModule implements OnModuleInit { 
    constructor(private readonly rolesService: RolesService) {}

    async onModuleInit() {
        await Role.createDefaultRoles(); 
    }
}
 