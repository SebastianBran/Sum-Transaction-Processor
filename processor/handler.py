import logging
import hashlib

from sawtooth_sdk.processor.exceptions import InvalidTransaction
from sawtooth_sdk.processor.handler import TransactionHandler

from payload import SumPayload
from state import SumState
from state import Sum


class SumTransactionHandler(TransactionHandler):
    def __init__(self):
        self._namespace_prefix = hashlib.sha512(
            'sum'.encode('utf-8')).hexdigest()[:6]

    @property
    def family_name(self):
        return 'sum'

    @property
    def family_versions(self):
        return ['1.0']

    @property
    def namespaces(self):
        return [self._namespace_prefix]

    def apply(self, transaction, context):
        print("Payload: {}".format(transaction.payload))

        sum_payload = SumPayload(transaction.payload)
        sum_state = SumState(context)

        print("sum_payload: name - {} | action - {} | num1 - {} | num2 - {}".format(
            sum_payload.name, sum_payload.action, sum_payload.num1, sum_payload.num2))


        if sum_payload.action == 'sum':
            if sum_state.get_sum(sum_payload.name) != -1:
                raise InvalidTransaction(
                    'Invalid action: Sum already exists: {}'.format(
                        sum_payload.name))

            sum = Sum(
                name=sum_payload.name,
                num1=sum_payload.num1,
                num2=sum_payload.num2,
                result=sum_payload.num1 + sum_payload.num2)

            sum_state.set_sum(sum_payload.name, sum)
        elif sum_payload.action == 'show':
            sum = sum_state.get_sum(sum_payload.name)
            if sum == -1:
                raise InvalidTransaction(
                    'Invalid action: Sum does not exist: {}'.format(
                        sum_payload.name))
            print("Sum: {}".format(sum))

        else:
            raise InvalidTransaction(
                'Invalid action: {}'.format(sum_payload.action))

    def _make_sum_address(self, sum):
        return self._namespace_prefix + hashlib.sha512(sum.encode('utf-8')).hexdigest()[:64]
