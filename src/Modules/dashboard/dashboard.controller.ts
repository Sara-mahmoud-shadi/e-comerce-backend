import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
// import { AuthGuard } from '@nestjs/passport'; // Add if authentication is needed

@ApiTags('Dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  // @UseGuards(AuthGuard('jwt')) // Add if this should be protected
  // @ApiBearerAuth()
  @Get('stats')
  @ApiOperation({ summary: 'Get total lengths for categories, products, and orders' })
  @ApiResponse({ status: 200, description: 'Returns dashboard statistics' })
  getStats() {
    return this.dashboardService.getStats();
  }
}
