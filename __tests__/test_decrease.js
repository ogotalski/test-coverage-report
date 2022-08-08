
const core = require("@actions/core");
const github = require("@actions/github");
const action = require("../src/action");
jest.mock("@actions/core");
jest.mock("@actions/github");


describe("Kover vs JaCoCo", function () {
    let createComment;
    let listComments;
    let updateComment;
    let output;

    function getInput(key) {
        switch (key) {
            case "sourcePaths":
                return "./__tests__/__fixtures__/src/main/kotlin,./__tests__/__fixtures__/MathUtils/src/main/java"
            case "paths":
                return "./__tests__/__fixtures__/report/report.xml,./__tests__/__fixtures__/report2/report.xml";
            case "masterPaths":
                return "./__tests__/__fixtures__/kover/report.xml";
        }
    }

    beforeEach(() => {
        console.log("mocking")
        createComment = jest.fn();
        listComments = jest.fn();
        updateComment = jest.fn();
        output = jest.fn();

        core.getInput = jest.fn(getInput);
        github.getOctokit = jest.fn(() => {
            return {
                repos: {
                    compareCommits: jest.fn(() => {
                        return compareCommitsResponse;
                    }),
                },
                issues: {
                    createComment: createComment,
                    listComments: listComments,
                    updateComment: updateComment,
                },
            };
        });
        core.setFailed = jest.fn((c) => {
            console.log(c);
            fail(c);
        });
    })

    const compareCommitsResponse = {
        data: {
            files: [
                {
                    filename: "src/main/kotlin/org/test/main/Math.kt",
                    blob_url:
                        "https://github.com/ogotalski/test/blob/master/src/main/kotlin/org/test/main/Math.kt",
                },
                {
                    filename: "src/test/kotlin/org/test/main/MathTest.kt",
                    blob_url:
                        "https://https://github.com/ogotalski/test/blob/master/src/test/kotlin/org/test/main/MathTest.kt",
                },
                {
                    filename: "MathUtils/src/main/java/org/test/math/utils/FibonacciRecurUtil.java",
                    blob_url:
                        "https://github.com/ogotalski/test/blob/master/MathUtils/src/main/java/org/test/math/utils/FibonacciRecurUtil.java",
                },
            ],
        },
    };

    describe("Pull Request", function () {
        const context = {
            eventName: "pull_request",
            payload: {
                pull_request: {
                    number: "1",
                    base: {
                        sha: "base",
                    },
                    head: {
                        sha: "head",
                    },
                },
            },
            repo: "test",
            owner: "ogotalski",
        };

        it("publish comment", async () => {
            github.context = context;

            await action.run();

            expect(createComment.mock.calls[0][0].body)
                .toEqual("\n" +
                    "#### :open_file_folder: 39.68% of the overall code covered by tests. 73.57% in master\n" +
                    "#### :inbox_tray: 91.43% of the files changed in pull request covered by tests.\n" +
                    "##### Details:\n" +
                    "<details><summary><kbd>org.test.math.utils.<b>FibonacciRecurUtil.java</b></kbd> - <b>100%</b>  (100%)</summary>\n" +
                    "\n" +
                    "```diff\n" +
                    "# 01: package org.test.math.utils;\n" +
                    "# 02: \n" +
                    "# 03: import java.util.HashMap;\n" +
                    "# 04: import java.util.Map;\n" +
                    "# 05: \n" +
                    "+ 06: public class FibonacciRecurUtil implements FibonacciUtil {\n" +
                    "# 07: \n" +
                    "+ 08:     Map<Long, Long> cacheMap = new HashMap<>();\n" +
                    "# 09: \n" +
                    "# 10:     @Override\n" +
                    "# 11:     public long calc(long number) {\n" +
                    "+ 12:         if (number <= 2) return 1;\n" +
                    "+ 13:         if (!cacheMap.containsKey(number))\n" +
                    "# 14:         {\n" +
                    "+ 15:             cacheMap.put(number, calc(number - 1) + calc(number - 2));\n" +
                    "# 16:         }\n" +
                    "+ 17:         return  cacheMap.get(number);\n" +
                    "# 18:     }\n" +
                    "# 19: }\n" +
                    "# 20: \n" +
                    "```\n" +
                    "[org.test.math.utils.FibonacciRecurUtil.java](https://github.com/ogotalski/test/blob/master/MathUtils/src/main/java/org/test/math/utils/FibonacciRecurUtil.java)\n" +
                    "\n" +
                    "<hr/></details>\n" +
                    "\n" +
                    "<details><summary><kbd>org.test.main.<b>Math.kt</b></kbd> - <b>75%</b>  (80%)</summary>\n" +
                    "\n" +
                    "```diff\n" +
                    "# 01: package org.test.main\n" +
                    "# 02: \n" +
                    "# 03: \n" +
                    "# 04: import org.test.math.utils.MathUtils\n" +
                    "# 05: \n" +
                    "+ 06: class Math {\n" +
                    "# 07:     fun getFibonacci(int: Int): Long {\n" +
                    "! 08:         if (int > 1)\n" +
                    "+ 09:             return MathUtils().fibonacciCalc(int.toLong())\n" +
                    "- 10:         if (int < 0)\n" +
                    "- 11:             return 0L\n" +
                    "- 12:         return -1L\n" +
                    "# 13:         }\n" +
                    "# 14: }\n" +
                    "```\n" +
                    "[org.test.main.Math.kt](https://github.com/ogotalski/test/blob/master/src/main/kotlin/org/test/main/Math.kt)\n" +
                    "\n" +
                    "<hr/></details>\n" +
                    "\n" +
                    "<hr/>\n" +
                    "\n" +
                    "### :rotating_light: Code coverage decrease for files outside Pull Request\n" +
                    " ##### Details:\n" +
                    " <details><summary><kbd>org.test.math.utils.<b>MathUtils.java</b></kbd> - <b>0%</b>  (100%)</summary>\n" +
                    "\n" +
                    "<dl><dd> <details><summary>\n" +
                    " <b>Pull Request:</b> <kbd><b>MathUtils.java#L00-12</b></kbd>\n" +
                    "\n" +
                    "```diff\n" +
                    "# 01: package org.test.math.utils;\n" +
                    "# 02: \n" +
                    "- 03: public class MathUtils {\n" +
                    "# 04: \n" +
                    "# 05:     public Long fibonacciCalc(long number)\n" +
                    "# 06:     {\n" +
                    "- 07:         return new FibonacciForkJoinUtil().calc(number);\n" +
                    "# 08:     }\n" +
                    "# 09: }\n" +
                    "# 10: \n" +
                    "```\n" +
                    "</summary>\n" +
                    "\n" +
                    "<b>Master:</b> <kbd><b>MathUtils.java#L00-12</b></kbd>\n" +
                    " ```diff\n" +
                    "# 01: package org.test.math.utils;\n" +
                    "# 02: \n" +
                    "+ 03: public class MathUtils {\n" +
                    "# 04: \n" +
                    "# 05:     public Long fibonacciCalc(long number)\n" +
                    "# 06:     {\n" +
                    "+ 07:         return new FibonacciForkJoinUtil().calc(number);\n" +
                    "# 08:     }\n" +
                    "# 09: }\n" +
                    "# 10: \n" +
                    "```\n" +
                    "</details>\n" +
                    "\n" +
                    " </dd></dl>\n" +
                    "\n" +
                    "\n" +
                    "<hr/></details>\n" +
                    "\n" +
                    "\n" +
                    "<details><summary><kbd>org.test.math.utils.<b>FibonacciForkJoinUtil.java</b></kbd> - <b>0%</b>  (92%)</summary>\n" +
                    "\n" +
                    "<dl><dd> <details><summary>\n" +
                    " <b>Pull Request:</b> <kbd><b>FibonacciForkJoinUtil.java#L01-12</b></kbd>\n" +
                    "\n" +
                    "```diff\n" +
                    "# 01: package org.test.math.utils;\n" +
                    "# 02: \n" +
                    "# 03: import java.util.concurrent.*;\n" +
                    "# 04: \n" +
                    "- 05: public class FibonacciForkJoinUtil implements FibonacciUtil {\n" +
                    "# 06: \n" +
                    "- 07:     ForkJoinPool executorService = (ForkJoinPool) Executors.newWorkStealingPool();\n" +
                    "# 08: \n" +
                    "# 09:     @Override\n" +
                    "# 10:     public long calc(long number) {\n" +
                    "# 11:         try {\n" +
                    "```\n" +
                    "</summary>\n" +
                    "\n" +
                    "<b>Master:</b> <kbd><b>FibonacciForkJoinUtil.java#L01-12</b></kbd>\n" +
                    " ```diff\n" +
                    "# 01: package org.test.math.utils;\n" +
                    "# 02: \n" +
                    "# 03: import java.util.concurrent.*;\n" +
                    "# 04: \n" +
                    "+ 05: public class FibonacciForkJoinUtil implements FibonacciUtil {\n" +
                    "# 06: \n" +
                    "+ 07:     ForkJoinPool executorService = (ForkJoinPool) Executors.newWorkStealingPool();\n" +
                    "# 08: \n" +
                    "# 09:     @Override\n" +
                    "# 10:     public long calc(long number) {\n" +
                    "# 11:         try {\n" +
                    "```\n" +
                    "</details>\n" +
                    "\n" +
                    " </dd>\n" +
                    "<dd> <details><summary>\n" +
                    " <b>Pull Request:</b> <kbd><b>FibonacciForkJoinUtil.java#L08-17</b></kbd>\n" +
                    "\n" +
                    "```diff\n" +
                    "# 08: \n" +
                    "# 09:     @Override\n" +
                    "# 10:     public long calc(long number) {\n" +
                    "# 11:         try {\n" +
                    "- 12:             return executorService.invoke(new FibonacciTask(number));\n" +
                    "# 13:         } catch (Exception e) {\n" +
                    "# 14:             throw new RuntimeException(e);\n" +
                    "# 15:         }\n" +
                    "# 16:     }\n" +
                    "```\n" +
                    "</summary>\n" +
                    "\n" +
                    "<b>Master:</b> <kbd><b>FibonacciForkJoinUtil.java#L08-17</b></kbd>\n" +
                    " ```diff\n" +
                    "# 08: \n" +
                    "# 09:     @Override\n" +
                    "# 10:     public long calc(long number) {\n" +
                    "# 11:         try {\n" +
                    "+ 12:             return executorService.invoke(new FibonacciTask(number));\n" +
                    "# 13:         } catch (Exception e) {\n" +
                    "# 14:             throw new RuntimeException(e);\n" +
                    "# 15:         }\n" +
                    "# 16:     }\n" +
                    "```\n" +
                    "</details>\n" +
                    "\n" +
                    " </dd>\n" +
                    "<dd> <details><summary>\n" +
                    " <b>Pull Request:</b> <kbd><b>FibonacciForkJoinUtil.java#L18-37</b></kbd>\n" +
                    "\n" +
                    "```diff\n" +
                    "# 18:     private class FibonacciTask extends RecursiveTask<Long>\n" +
                    "# 19:     {\n" +
                    "# 20:         private Long number;\n" +
                    "# 21: \n" +
                    "- 22:         public FibonacciTask(Long number) {\n" +
                    "- 23:             this.number = number;\n" +
                    "- 24:         }\n" +
                    "# 25: \n" +
                    "# 26:         @Override\n" +
                    "# 27:         protected Long compute() {\n" +
                    "- 28:             if (number <= 2) return 1L;\n" +
                    "- 29:             FibonacciTask fibonacciTask1 = new FibonacciTask(number - 1);\n" +
                    "- 30:             fibonacciTask1.fork();\n" +
                    "- 31:             FibonacciTask fibonacciTask2 = new FibonacciTask(number - 2);\n" +
                    "- 32:             return fibonacciTask2.compute() + fibonacciTask1.join();\n" +
                    "# 33:         }\n" +
                    "# 34:     }\n" +
                    "# 35: }\n" +
                    "# 36: \n" +
                    "```\n" +
                    "</summary>\n" +
                    "\n" +
                    "<b>Master:</b> <kbd><b>FibonacciForkJoinUtil.java#L18-37</b></kbd>\n" +
                    " ```diff\n" +
                    "# 18:     private class FibonacciTask extends RecursiveTask<Long>\n" +
                    "# 19:     {\n" +
                    "# 20:         private Long number;\n" +
                    "# 21: \n" +
                    "+ 22:         public FibonacciTask(Long number) {\n" +
                    "+ 23:             this.number = number;\n" +
                    "+ 24:         }\n" +
                    "# 25: \n" +
                    "# 26:         @Override\n" +
                    "# 27:         protected Long compute() {\n" +
                    "+ 28:             if (number <= 2) return 1L;\n" +
                    "+ 29:             FibonacciTask fibonacciTask1 = new FibonacciTask(number - 1);\n" +
                    "+ 30:             fibonacciTask1.fork();\n" +
                    "+ 31:             FibonacciTask fibonacciTask2 = new FibonacciTask(number - 2);\n" +
                    "+ 32:             return fibonacciTask2.compute() + fibonacciTask1.join();\n" +
                    "# 33:         }\n" +
                    "# 34:     }\n" +
                    "# 35: }\n" +
                    "# 36: \n" +
                    "```\n" +
                    "</details>\n" +
                    "\n" +
                    " </dd></dl>\n" +
                    "\n" +
                    "\n" +
                    "<hr/></details>\n" +
                    "\n" +
                    "\n" +
                    "<details><summary><kbd>org.test.math.utils.<b>FibonacciParallelUtil.java</b></kbd> - <b>0%</b>  (0%)</summary>\n" +
                    "\n" +
                    "<dl><dd> <details><summary>\n" +
                    " <b>Pull Request:</b> <kbd><b>FibonacciParallelUtil.java#L04-22</b></kbd>\n" +
                    "\n" +
                    "```diff\n" +
                    "# 04: import java.util.concurrent.Executors;\n" +
                    "# 05: \n" +
                    "# 06: public class FibonacciParallelUtil implements FibonacciUtil {\n" +
                    "# 07: \n" +
                    "- 08:     ExecutorService executorService = Executors.newFixedThreadPool(5);\n" +
                    "# 09: \n" +
                    "# 10:     @Override\n" +
                    "# 11:     public long calc(long number) {\n" +
                    "- 12:         if (number <= 2) return 0;\n" +
                    "# 13:         try {\n" +
                    "- 14:             long result = executorService.submit(() -> calc(number - 1)).get() +\n" +
                    "# 15:                     executorService.submit(() -> calc(number - 2)).get();\n" +
                    "# 16:             return result;\n" +
                    "- 17:         } catch (Exception e) {\n" +
                    "# 18:             throw new RuntimeException(e);\n" +
                    "# 19:         }\n" +
                    "# 20:     }\n" +
                    "# 21: }\n" +
                    "```\n" +
                    "</summary>\n" +
                    "\n" +
                    "<b>Master:</b> <kbd><b>FibonacciParallelUtil.java#L04-22</b></kbd>\n" +
                    " ```diff\n" +
                    "# 04: import java.util.concurrent.Executors;\n" +
                    "# 05: \n" +
                    "# 06: public class FibonacciParallelUtil implements FibonacciUtil {\n" +
                    "# 07: \n" +
                    "- 08:     ExecutorService executorService = Executors.newFixedThreadPool(5);\n" +
                    "# 09: \n" +
                    "# 10:     @Override\n" +
                    "# 11:     public long calc(long number) {\n" +
                    "- 12:         if (number <= 2) return 0;\n" +
                    "# 13:         try {\n" +
                    "- 14:             long result = executorService.submit(() -> calc(number - 1)).get() +\n" +
                    "# 15:                     executorService.submit(() -> calc(number - 2)).get();\n" +
                    "# 16:             return result;\n" +
                    "- 17:         } catch (Exception e) {\n" +
                    "# 18:             throw new RuntimeException(e);\n" +
                    "# 19:         }\n" +
                    "# 20:     }\n" +
                    "# 21: }\n" +
                    "```\n" +
                    "</details>\n" +
                    "\n" +
                    " </dd></dl>\n" +
                    "\n" +
                    "\n" +
                    "<hr/></details>\n" +
                    "\n" +
                    "\n");
        });
    });
});


describe("Jacoco with missing master files", function () {
    let createComment;
    let listComments;
    let updateComment;
    let output;

    function getInput(key) {
        switch (key) {
            case "sourcePaths":
                return "./__tests__/__fixtures__/src/main/kotlin,./__tests__/__fixtures__/MathUtils/src/main/java"
            case "paths":
                return "./__tests__/__fixtures__/report/report.xml,./__tests__/__fixtures__/report2/report.xml";
            case "masterPaths":
                return "./__tests__/__fixtures__/unexist/report.xml";
        }
    }

    beforeEach(() => {
        console.log("mocking")
        createComment = jest.fn();
        listComments = jest.fn();
        updateComment = jest.fn();
        output = jest.fn();

        core.getInput = jest.fn(getInput);
        github.getOctokit = jest.fn(() => {
            return {
                repos: {
                    compareCommits: jest.fn(() => {
                        return compareCommitsResponse;
                    }),
                },
                issues: {
                    createComment: createComment,
                    listComments: listComments,
                    updateComment: updateComment,
                },
            };
        });
        core.setFailed = jest.fn((c) => {
            console.log(c);
            fail(c);
        });
    })

    const compareCommitsResponse = {
        data: {
            files: [
                {
                    filename: "src/main/kotlin/org/test/main/Math.kt",
                    blob_url:
                        "https://github.com/ogotalski/test/blob/master/src/main/kotlin/org/test/main/Math.kt",
                },
                {
                    filename: "src/test/kotlin/org/test/main/MathTest.kt",
                    blob_url:
                        "https://https://github.com/ogotalski/test/blob/master/src/test/kotlin/org/test/main/MathTest.kt",
                },
                {
                    filename: "MathUtils/src/main/java/org/test/math/utils/FibonacciRecurUtil.java",
                    blob_url:
                        "https://github.com/ogotalski/test/blob/master/MathUtils/src/main/java/org/test/math/utils/FibonacciRecurUtil.java",
                },
            ],
        },
    };

    describe("Pull Request", function () {
        const context = {
            eventName: "pull_request",
            payload: {
                pull_request: {
                    number: "1",
                    base: {
                        sha: "base",
                    },
                    head: {
                        sha: "head",
                    },
                },
            },
            repo: "test",
            owner: "ogotalski",
        };

        it("publish comment", async () => {
            github.context = context;

            await action.run();

            expect(createComment.mock.calls[0][0].body)
                .toEqual("\n" +
                    "#### :open_file_folder: 39.68% of the overall code covered by tests. \n" +
                    "#### :inbox_tray: 91.43% of the files changed in pull request covered by tests.\n" +
                    "##### Details:\n" +
                    "<details><summary><kbd>org.test.math.utils.<b>FibonacciRecurUtil.java</b></kbd> - <b>100%</b> </summary>\n" +
                    "\n" +
                    "```diff\n" +
                    "# 01: package org.test.math.utils;\n" +
                    "# 02: \n" +
                    "# 03: import java.util.HashMap;\n" +
                    "# 04: import java.util.Map;\n" +
                    "# 05: \n" +
                    "+ 06: public class FibonacciRecurUtil implements FibonacciUtil {\n" +
                    "# 07: \n" +
                    "+ 08:     Map<Long, Long> cacheMap = new HashMap<>();\n" +
                    "# 09: \n" +
                    "# 10:     @Override\n" +
                    "# 11:     public long calc(long number) {\n" +
                    "+ 12:         if (number <= 2) return 1;\n" +
                    "+ 13:         if (!cacheMap.containsKey(number))\n" +
                    "# 14:         {\n" +
                    "+ 15:             cacheMap.put(number, calc(number - 1) + calc(number - 2));\n" +
                    "# 16:         }\n" +
                    "+ 17:         return  cacheMap.get(number);\n" +
                    "# 18:     }\n" +
                    "# 19: }\n" +
                    "# 20: \n" +
                    "```\n" +
                    "[org.test.math.utils.FibonacciRecurUtil.java](https://github.com/ogotalski/test/blob/master/MathUtils/src/main/java/org/test/math/utils/FibonacciRecurUtil.java)\n" +
                    "\n" +
                    "<hr/></details>\n" +
                    "\n" +
                    "<details><summary><kbd>org.test.main.<b>Math.kt</b></kbd> - <b>75%</b> </summary>\n" +
                    "\n" +
                    "```diff\n" +
                    "# 01: package org.test.main\n" +
                    "# 02: \n" +
                    "# 03: \n" +
                    "# 04: import org.test.math.utils.MathUtils\n" +
                    "# 05: \n" +
                    "+ 06: class Math {\n" +
                    "# 07:     fun getFibonacci(int: Int): Long {\n" +
                    "! 08:         if (int > 1)\n" +
                    "+ 09:             return MathUtils().fibonacciCalc(int.toLong())\n" +
                    "- 10:         if (int < 0)\n" +
                    "- 11:             return 0L\n" +
                    "- 12:         return -1L\n" +
                    "# 13:         }\n" +
                    "# 14: }\n" +
                    "```\n" +
                    "[org.test.main.Math.kt](https://github.com/ogotalski/test/blob/master/src/main/kotlin/org/test/main/Math.kt)\n" +
                    "\n" +
                    "<hr/></details>\n" +
                    "\n");
        });
    });
});
