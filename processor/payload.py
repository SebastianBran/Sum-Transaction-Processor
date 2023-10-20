from sawtooth_sdk.processor.exceptions import InvalidTransaction


class SumPayload(object):
    def __init__(self, payload):
        try:
            name, action, num1, num2 = payload.decode().split(",")
        except ValueError:
            raise InvalidTransaction("Invalid payload serialization")

        if not name:
            raise InvalidTransaction("Name is required")

        if not action:
            raise InvalidTransaction("Action is required")

        if action not in ('sum', 'show'):
            raise InvalidTransaction("Invalid action: {}".format(action))

        if action == 'sum':
            if not num1 or not num1.isdigit():
                print("Num1 is required")
                raise InvalidTransaction("Num1 is required")
            else:
                print("Num1: {}".format(num1))
                num1 = int(num1)

            if not num2 or not num2.isdigit():
                print("Num2 is required")
                raise InvalidTransaction("Num2 is required")
            else:
                print("Num2: {}".format(num2))
                num2 = int(num2)

        self._name = name
        self._action = action
        self._num1 = num1
        self._num2 = num2

    @property
    def name(self):
        return self._name
    
    @property
    def action(self):
        return self._action

    @property
    def num1(self):
        return self._num1

    @property
    def num2(self):
        return self._num2
