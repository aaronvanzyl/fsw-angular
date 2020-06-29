import { Component, OnInit, Inject } from '@angular/core';
import { Dish } from '../shared/dish';
import { DishService } from '../services/dish.service';
import { Promotion } from '../shared/promotion';
import { PromotionService } from '../services/promotion.service';
import { Leader } from '../shared/leader';
import { LeaderService } from '../services/leader.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  dish: Dish;
  dishErrMsg: string;
  promotion: Promotion;
  leader: Leader;

  constructor(private dishService: DishService, 
    private promotionService: PromotionService, 
    private leaderService: LeaderService,
    @Inject("BaseURL") private BaseURL) { }

  ngOnInit() {
    this.dishService.getFeaturedDish()
      .subscribe((result) => this.dish = result,
      errMsg => this.dishErrMsg = errMsg);
    this.promotionService.getFeaturedPromotion()
      .subscribe((result) => this.promotion = result);
    this.leaderService.getFeaturedLeader()
      .subscribe((result) => this.leader = result);
  }
}
