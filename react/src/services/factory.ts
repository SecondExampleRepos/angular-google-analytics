/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import factory from './factoryWithTypeCheckers';

const PropTypesService = (isValidElement: (element: any) => boolean) => {
  const throwOnDirectAccess = false;
  return factory(isValidElement, throwOnDirectAccess);
};

export default PropTypesService;