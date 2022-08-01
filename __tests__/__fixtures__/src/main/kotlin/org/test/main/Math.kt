package org.test.main


import org.test.math.utils.MathUtils

class Math {
    fun getFibonacci(int: Int): Long {
        if (int > 1)
            return MathUtils().fibonacciCalc(int.toLong())
        if (int < 0)
            return 0L
        return -1L
        }
}