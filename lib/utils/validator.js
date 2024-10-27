import validator from 'validator';
import _ from 'lodash';

function localValidator() {
  this.notEmpty = str => !this.isEmpty(str);
}

localValidator.prototype = validator;


class Validate {

  constructor() {
    this.validator = new localValidator();
  }

  dataCheck(data, prop) {
    if (_.isUndefined(data)) {
      prop.push('');
    } else {
      prop.push(data.toString());
    }
  }

  optionsCheck(check, options, prop) {
    if (!_.isEmpty(options)) {
      if (check === 'matches') {
        prop.push(options.pattern);
        if (options.modifiers) {
          prop.push(options.modifiers);
        }
      } else {
        const keys = _.keys(options);
        prop.push(options[keys[0]]);
      }
    }
  }

  check(data, constraints, throwErrors = true) {
    const errorList = {};

    for (const param in constraints) {

      let value = _.get(data, param);

      // If field doesn't exist need check notEmpty only
      if (value === undefined) {
        // If data doesn't exists return error end stop validation this field
        if (constraints[param].notEmpty) {
          errorList[param] = constraints[param].notEmpty.message;
        }
        continue;
      }

      value = _.trim(value);

      for (const check in constraints[param]) {

        if (!value && constraints[param].notEmpty && check !== 'notEmpty') {
          continue;
        }

        const prop = [];

        if (!data || !value) {
          errorList[param] = constraints[param][check].message;
          continue;
        }
        this.dataCheck(value, prop);

        this.optionsCheck(check, _.omit(constraints[param][check], ['message']), prop);

        if (!this.validator[check](...prop)) {
          errorList[param] = constraints[param][check].message;
        }
      }
    }

    if (throwErrors && Object.keys(errorList).length) {
      throw (errorList);
    }

    return errorList;
  }
}

export default new Validate();
