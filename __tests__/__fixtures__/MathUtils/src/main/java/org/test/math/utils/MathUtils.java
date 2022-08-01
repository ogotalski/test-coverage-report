package org.test.math.utils;

public class MathUtils {

    public Long fibonacciCalc(long number)
    {
        return new FibonacciForkJoinUtil().calc(number);
    }
}
