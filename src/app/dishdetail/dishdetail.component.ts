import { Component, OnInit, Input, ViewChild, Inject } from '@angular/core';
import { Dish } from '../shared/dish';
import { DishService } from '../services/dish.service';
import { Params, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { switchMap } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Feedback, ContactType } from '../shared/feedback';
import { Comment } from '../shared/comment';
import { error } from 'protractor';

@Component({
    selector: 'app-dishdetail',
    templateUrl: './dishdetail.component.html',
    styleUrls: ['./dishdetail.component.scss']
})
export class DishdetailComponent implements OnInit {
    formErrors = {
        'author': '',
        'comment': '',
    };

    validationMessages = {
        'author': {
            'required': 'Author Name is required.',
            'minlength': 'Author Name must be at least 2 characters long.',
            'maxlength': 'Author Name cannot be more than 25 characters long.'
        },
        'comment': {
            'required': 'Comment is required.',
        },
    };

    dish: Dish;
    dishIds: string[];
    prev: string;
    next: string;
    commentForm: FormGroup;
    newComment: Comment;
    errMsg: string;
    dishcopy: Dish;

    constructor(private dishService: DishService,
        private route: ActivatedRoute,
        private location: Location,
        private fb: FormBuilder,
        @Inject("BaseURL") private BaseURL) {
            
    }

    ngOnInit() {
        this.createForm();
        this.dishService.getDishIds()
            .subscribe((result) => this.dishIds = result,
                errMsg => this.errMsg = errMsg);
        this.route.params
            .pipe(switchMap((params: Params) => this.dishService.getDish(params['id'])))
            .subscribe(dish => { this.dish = dish; this.dishcopy = dish; this.setPrevNex(dish.id); },
                errMsg => this.errMsg = errMsg);
        

    }

    setPrevNex(dishId: string) {
        const index = this.dishIds.indexOf(dishId);
        this.prev = this.dishIds[(this.dishIds.length + index - 1) % this.dishIds.length];
        this.next = this.dishIds[(this.dishIds.length + index + 1) % this.dishIds.length];
    }

    goBack(): void {
        this.location.back();
    }

    createForm() {
        this.commentForm = this.fb.group({
            author: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(25)]],
            rating: [5, []],
            comment: ['', [Validators.required]],
        });

        this.commentForm.valueChanges
            .subscribe(data => this.onValueChanged(data));
        this.onValueChanged();
    }

    onValueChanged(data?: any) {
        if (!this.commentForm) { return; }
        const form = this.commentForm;
        for (const field in this.formErrors) {
            if (this.formErrors.hasOwnProperty(field)) {
                this.formErrors[field] = '';
                const control = form.get(field);
                if (control && control.dirty && !control.valid) {
                    const messages = this.validationMessages[field];
                    for (const key in control.errors) {
                        if (control.errors.hasOwnProperty(key)) {
                            this.formErrors[field] += messages[key] + ' ';
                        }
                    }
                }
            }
        }
    }

    onSubmit() {
        if (this.commentForm.valid) {
            this.newComment = this.commentForm.value;
            this.newComment.date = Date.now().toString();
            console.log(this.newComment);
            this.dishcopy.comments.push(this.newComment);
            this.dishService.putDish(this.dishcopy)
                .subscribe(
                    dish => { this.dish = dish; this.dishcopy = dish },
                    errMsg => { this.dish = null; this.dishcopy = null; this.errMsg = errMsg; })
        }

        this.commentForm.reset({
            author: '',
            rating: 5,
            comment: ''
        });
    }
}
