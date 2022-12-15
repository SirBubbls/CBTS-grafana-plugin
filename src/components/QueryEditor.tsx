import defaults from 'lodash/defaults';

import React, { ChangeEvent, PureComponent } from 'react';
import { LegacyForms, InlineField } from '@grafana/ui';
import { QueryEditorProps } from '@grafana/data';
import { DataSource } from '../datasource';
import { defaultQuery, MyDataSourceOptions, MyQuery } from '../types';

const { FormField } = LegacyForms;

type Props = QueryEditorProps<DataSource, MyQuery, MyDataSourceOptions>;

export class QueryEditor extends PureComponent<Props> {

  onConstantChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onChange, query, onRunQuery } = this.props;
    onChange({ ...query, constant: parseInt(event.target.value) });
    // executes the query
    onRunQuery();
  };

  render() {
    const query = defaults(this.props.query, defaultQuery);
    const { queryText, constant } = query;

    return (
      <div className="gf-form">
        <FormField
          width={10}
          value={constant}
          onChange={this.onConstantChange}
          label="No. Max. Points"
          type="number"
          step="1"
        />
      </div>
    );
  }
}
