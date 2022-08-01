package org.test.math.utils;

public class FibonacciLinearUtil implements FibonacciUtil {
    @Override
    public long calc(long number) {
        if(number <=2)
            return 1;
        long a = 1;
        long b = 1;
        long c;
        for (int i = 3; i < number + 1; i++) {
            c = b;
            b = b + a;
            a = c;
        }
        return b;
    }
}
