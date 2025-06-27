import { Injectable } from '@nestjs/common';
import { Counter, Registry } from 'prom-client';

@Injectable()
export class MetricsService {
  private readonly registry = new Registry();
  public readonly urlShortenedCounter: Counter;

  constructor() {
    this.urlShortenedCounter = new Counter({
      name: 'url_shortened_total',
      help: 'Total number of shortened URLs created.',
      labelNames: ['user_type'],
    });

    this.registry.registerMetric(this.urlShortenedCounter);
  }
}
