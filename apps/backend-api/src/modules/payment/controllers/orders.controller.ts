import {
    Controller,
    Get,
    Param,
    Query,
    Req,
    UseGuards,
    UsePipes,
    ValidationPipe,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { OrdersService } from '../services/orders.service';
import { OrderListQueryDto } from '../dtos/order-list-query.dto';
import { OrderListResponseDto } from '../dtos/order-list-response.dto';
import { OrderDetailDto } from '../dtos/order-detail.dto';

@Controller('orders')
@ApiTags('Orders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) { }

    @Get()
    @ApiOperation({ summary: 'Get current user order history' })
    @ApiOkResponse({ type: OrderListResponseDto })
    async getOrders(@Req() req: any, @Query() query: OrderListQueryDto) {
        return this.ordersService.getOrderHistory(req.user.sub, query);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a single order breakdown' })
    @ApiOkResponse({ type: OrderDetailDto })
    @ApiNotFoundResponse({ description: 'Order not found' })
    async getOrderById(@Req() req: any, @Param('id') id: string) {
        return this.ordersService.getOrderDetail(req.user.sub, id);
    }
}