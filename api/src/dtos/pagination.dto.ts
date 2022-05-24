import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export enum Order {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class PaginationOptionsDto {
  @IsEnum(Order)
  @IsOptional()
  readonly order?: Order = Order.DESC;

  @IsOptional()
  readonly orderBy?: string = 'updatedAt';

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  readonly page?: number = 1;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  @IsOptional()
  readonly limit?: number = 10;

  get offset(): number {
    return (this.page - 1) * this.limit;
  }
}

export class PaginationDto {
  readonly pageCount: number;
  readonly currentPage: number;
  readonly hasNextPage: boolean;
  readonly hasPrevPage: boolean;
  readonly itemCount: number;
  readonly limit: number;

  constructor(itemCount: number, options: PaginationOptionsDto) {
    this.currentPage = options.page;
    this.limit = options.limit;
    this.itemCount = itemCount;
    this.pageCount = Math.ceil(this.itemCount / this.limit);
    this.hasPrevPage = this.currentPage > 1;
    this.hasNextPage = this.currentPage < this.pageCount;
  }
}
