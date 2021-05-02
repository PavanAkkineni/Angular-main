import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { Params , ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Dish } from '../shared/dish';
import { DishService } from '../services/dish.service';
import { switchMap } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Feedback1 } from '../shared/feedback';
import { trigger,state, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'app-dishdetail',
  templateUrl: './dishdetail.component.html',
  styleUrls: ['./dishdetail.component.scss'],
  animations: [
  trigger('visibility', [
      state('shown', style({
          transform: 'scale(1.0)',
          opacity: 1
      })),
      state('hidden', style({
          transform: 'scale(0.5)',
          opacity: 0
      })),
      transition('* => *', animate('0.5s ease-in-out'))
  ])
]
})
export class DishdetailComponent implements OnInit {
  feedbackForm: FormGroup;
  feedback: Feedback1;
  @ViewChild('fform') feedbackFormDirective;

  formErrors = {
    'firstname': ''
  };

  validationMessages = {
    'firstname': {
      'required':      'First Name is required.',
      'minlength':     'First Name must be at least 2 characters long.',
      'maxlength':     'FirstName cannot be more than 25 characters long.'
    },
  };


  dish: Dish;
  errMess: string;
  dishIds: string[];
  prev: string;
  next: string;
  dishcopy: Dish;
  visibility = 'shown';


  constructor(private dishService: DishService,
    private route: ActivatedRoute,
    private location: Location,
    private fb: FormBuilder,
    @Inject('BaseURL') private BaseURL) { }

    ngOnInit() {
      this.createForm();

      this.dishService.getDishIds().subscribe(dishIds => this.dishIds = dishIds);
      this.route.params.pipe(switchMap((params: Params) =>{this.visibility = 'hidden' ; return this.dishService.getDish(params['id']); }))
      .subscribe(dish => { this.dish = dish; this.setPrevNext(dish.id); this.visibility = 'shown'; }
       errmess => this.errMess = <any>errmess );
    }

  setPrevNext(dishId: string){
    const index = this.dishIds.indexOf(dishId);
    this.prev = this.dishIds[(this.dishIds.length + index - 1) % this.dishIds.length];
    this.next = this.dishIds[(this.dishIds.length + index + 1) % this.dishIds.length];
  }

  goBack(): void {
    this.location.back();
  }
  createForm() {
    this.feedbackForm = this.fb.group({
      firstname: ['',[ Validators.required ,Validators.minLength(2),Validators.maxLength(25)]],

      message: ''
    });

    this.feedbackForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged(); // (re)set validation messages now


  }
  onValueChanged(data?: any) {
    if (!this.feedbackForm) { return; }
    const form = this.feedbackForm;
    for (const field in this.formErrors) {
      if (this.formErrors.hasOwnProperty(field)) {
        // clear previous error message (if any)
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
    this.feedback = this.feedbackForm.value;
    console.log(this.feedback);
    this.feedbackForm.reset({
      firstname: '',

      message: ''
    });
    this.feedbackFormDirective.resetForm();
  }




}
