import hashlib


class Sum:
    def __init__(self, name='', num1='', num2='', result=''):
        self.name = str(name)
        self.num1 = str(num1)
        self.num2 = str(num2)
        self.result = str(result)


class SumState:
    def __init__(self, context):
        self._context = context
        self._namespace_prefix = hashlib.sha512(
            'sum'.encode('utf-8')).hexdigest()[:6]

    def get_sum(self, name):
        print("get_sum: {}".format(name))
        address = self._make_address(name)
        state_entries = self._context.get_state([address], timeout=3)
        print("state_entries: {}".format(state_entries))
        if state_entries:
            try:
                return state_entries[0].data.dec_ode().split(",")[3]
            except ValueError:
                return -1
        else:
            return -1

    def set_sum(self, name, sum: Sum):
        print("set_sum: {}".format(name))
        print("sum object: {}".format(sum))
        address = self._make_address(name)
        state_data = ','.join([sum.name, sum.num1, sum.num2, sum.result])
        encoded_data = state_data.encode()
        self._context.set_state({address: encoded_data}, timeout=3)

    def _make_address(self, name):
        return self._namespace_prefix + hashlib.sha512(name.encode('utf-8')).hexdigest()[:64]
