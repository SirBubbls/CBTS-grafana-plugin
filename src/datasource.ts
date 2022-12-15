// import defaults from 'lodash/defaults';
import { Observable  } from 'rxjs'
import {
  DataQueryRequest,
  DataQueryResponse,
  DataSourceApi,
  LoadingState,
  DataSourceInstanceSettings,
  CircularDataFrame,
  FieldType,
} from '@grafana/data';

import { MyQuery, MyDataSourceOptions } from './types';

export class DataSource extends DataSourceApi<MyQuery, MyDataSourceOptions> {
  endpoint: string;
  port: string;
  key: string;

  constructor(instanceSettings: DataSourceInstanceSettings<MyDataSourceOptions>) {
    super(instanceSettings);

    this.endpoint  = instanceSettings.jsonData.endpoint;
    this.key = instanceSettings.jsonData.apiKey;
    this.port  = instanceSettings.jsonData.port;
  }

  query(options: DataQueryRequest<MyQuery>): Observable<DataQueryResponse> {
    let uri  = `${this.endpoint}?apikey=${this.key}:${this.port}`
    const socket = new WebSocket(uri);
    const frame = new CircularDataFrame({
      append: 'tail',
      capacity: options.targets[0].constant,
    });
    frame.addField({ name: 'time', type: FieldType.time});
    frame.addField({ name: 'X', type: FieldType.number });
    frame.addField({ name: 'Y', type: FieldType.number });
    frame.addField({ name: 'object_class', type: FieldType.number });
    frame.addField({ name: 'object_id', type: FieldType.number });

    return new Observable<DataQueryResponse>(subscriber => {
      socket.addEventListener('message', function (event) {
        const parsed = JSON.parse(event.data);
        parsed.object_epsg4326.map((coords, i)  => frame.add({ object_id: parsed.object_id[i], class:parsed.object_class[i], time: parsed.time, X:  coords[0], Y :coords[1]}));
        subscriber.next({
          data: [frame],
          state: LoadingState.Streaming
        });
      });
    });
  }

  async testDatasource() {
    // Implement a health check for your data source.
    return {
      status: 'success',
      message: 'Success',
    };
  }
}
