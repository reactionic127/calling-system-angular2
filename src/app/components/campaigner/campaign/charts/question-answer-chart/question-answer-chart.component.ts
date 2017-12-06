import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { ResponseTypeObj, QuestionAnswer } from '../../../../../models';
import '../../../../../../../node_modules/chart.js/src/chart.js';

type ChartType = 'line' | 'horizontalBar' | 'doughnut' | 'radar' | 'pie' | 'polar';

@Component({
  selector   : 'question-answer-chart',
  templateUrl: './question-answer-chart.component.html'
})
export class QuestionAnswerChartComponent implements OnInit, OnChanges {
  @Input() questionAnswer: QuestionAnswer;

  questionTypes: any = ResponseTypeObj;

  public chartType: ChartType;
  public data: number[]   = [];
  public datasets: any[]  = [];
  public labels: string[] = [];
  public options: any     = {
    legend    : {
      display: false
    },
    responsive: true
  };

  constructor() {
  }

  ngOnInit(): void {
  }

  ngOnChanges(): void {
    this.setChartTypeAndOptions();
    this.extractData();
  }

  setChartTypeAndOptions(): void {
    switch (this.questionAnswer.responseType) {
      case this.questionTypes.multipleRadio:
        this.chartType = 'pie';
        break;
      case this.questionTypes.stars:
      case this.questionTypes.nps:
        this.chartType                = 'doughnut';
        this.options.cutoutPercentage = 90;
        break;
      case this.questionTypes.multipleCheckbox:
        this.chartType = 'horizontalBar';

        this.options.scales = {
          xAxes: [{
            gridLines: {
              display   : false,
              drawBorder: false
            },
            ticks    : {
              beginAtZero: true
            }
          }],
          yAxes: [{
            gridLines         : {
              display   : false,
              drawBorder: false
            },
            categoryPercentage: 1,
            barPercentage     : 0.3
          }]
        };
        break;

      default:
        this.chartType = 'pie';
        break;
    }
  }

  extractData(): void {
    this.labels = this.questionAnswer.distribution ? Object.keys(this.questionAnswer.distribution) : [];

    this.labels.forEach(
      (label: string) => {
        if (this.questionAnswer.distribution[label] && this.questionAnswer.percentDistribution[label]) {
          this.data.push(this.questionAnswer.percentDistribution[label]);
        }
      }
    );

    if (this.chartType === 'horizontalBar') {
      this.datasets = [{
        data                : this.data,
        backgroundColor     : [
          'rgba(188, 206, 249, 1)',
          'rgba(174, 196, 248, 1)',
          'rgba(147, 177, 246, 1)',
          'rgba(121, 157, 244, 1)',
          'rgba(97, 139, 237, 1)'
        ],
        hoverBackgroundColor: [
          'rgba(174, 196, 248, 1)',
          'rgba(147, 177, 246, 1)',
          'rgba(121, 157, 244, 1)',
          'rgba(97, 139, 237, 1)',
          'rgba(60, 111, 232, 1)'
        ]
      }];
    }
  }
}
