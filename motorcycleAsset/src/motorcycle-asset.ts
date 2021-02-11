/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Object, Property } from 'fabric-contract-api';

@Object()
export class MotorcycleAsset {

    @Property()
    public value: string;

}
