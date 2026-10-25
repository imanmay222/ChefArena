import type { AdminProblem } from "@/types";

/** Samples and solve counts are derived by the mock adapter (see lib/services/mock/db.ts). */
export type ProblemSeed = Omit<AdminProblem, "samples" | "solvedCount" | "attemptCount">;

/**
 * Six problems: three from the completed Weekly #41 and three in the live
 * Weekly #42. Hidden test cases and reference solutions live here too, but
 * only the admin service ever returns them.
 *
 * Statement strings support `inline code` and **bold**.
 */
export const seedProblems: ProblemSeed[] = [
  {
    id: "CA101",
    code: "A",
    title: "Spice Rack Balance",
    difficulty: "easy",
    points: 100,
    topics: ["arrays"],
    statement: [
      "Chef keeps `n` spice jars on a single shelf, numbered from left to right. The `i`-th jar weighs `a[i]` grams.",
      "Chef wants to split the shelf into a left part and a right part with a single cut so that both parts weigh exactly the same. Find the **smallest** number of jars `k` (1 ≤ k < n) that can be kept in the left part, or report that no balanced cut exists.",
    ],
    inputFormat: [
      "The first line contains an integer `n`.",
      "The second line contains `n` space-separated integers `a[1], a[2], …, a[n]`.",
    ],
    outputFormat: ["Print the smallest valid `k`, or `-1` if the shelf cannot be balanced."],
    constraints: ["2 ≤ n ≤ 2·10⁵", "1 ≤ a[i] ≤ 10⁹", "Use 64-bit integers for sums."],
    timeLimitMs: 1000,
    memoryLimitMb: 256,
    languages: ["cpp", "java", "python", "go"],
    contestId: "weekly-41",
    author: "u_lead",
    published: true,
    testCases: [
      { id: "CA101-t1", problemId: "CA101", label: "Sample 1", kind: "sample", input: "5\n3 1 2 4 2", output: "3", weight: 1, explanation: "The left part 3 + 1 + 2 = 6 matches the right part 4 + 2 = 6." },
      { id: "CA101-t2", problemId: "CA101", label: "Sample 2", kind: "sample", input: "3\n1 2 4", output: "-1", weight: 1, explanation: "The total weight 7 is odd, so no cut can balance it." },
      { id: "CA101-t3", problemId: "CA101", label: "Two equal jars", kind: "hidden", input: "2\n7 7", output: "1", weight: 1, inputFileName: "03.in", outputFileName: "03.out" },
      { id: "CA101-t4", problemId: "CA101", label: "Large values", kind: "hidden", input: "4\n1000000000 1000000000 1000000000 1000000000", output: "2", weight: 2, inputFileName: "04.in", outputFileName: "04.out" },
    ],
    referenceSolution: {
      language: "cpp",
      source:
        "#include <bits/stdc++.h>\nusing namespace std;\nint main(){int n;cin>>n;vector<long long>a(n);long long s=0;for(auto&x:a){cin>>x;s+=x;}\n long long p=0;for(int k=1;k<n;k++){p+=a[k-1];if(2*p==s){cout<<k;return 0;}}cout<<-1;}\n",
    },
    editorial:
      "Compute the total sum S. Sweep from the left keeping a prefix sum P; the first k with 2·P = S is the answer. O(n) time, O(1) extra memory.",
  },
  {
    id: "CA102",
    code: "B",
    title: "Kitchen Queue",
    difficulty: "medium",
    points: 200,
    topics: ["greedy", "arrays"],
    statement: [
      "The restaurant has a single stove and `n` pending orders. Order `i` takes `t[i]` minutes to cook, and only one order can be on the stove at a time.",
      "An order's **completion time** is the minute at which it leaves the stove. Chef may cook the orders in any sequence. Find the minimum possible sum of completion times over all orders.",
    ],
    inputFormat: ["The first line contains an integer `n`.", "The second line contains `n` integers `t[1], …, t[n]`."],
    outputFormat: ["Print a single integer: the minimum total completion time."],
    constraints: ["1 ≤ n ≤ 10⁵", "1 ≤ t[i] ≤ 10⁶", "The answer fits in a signed 64-bit integer."],
    timeLimitMs: 1000,
    memoryLimitMb: 256,
    languages: ["cpp", "java", "python", "go"],
    contestId: "weekly-41",
    author: "u_lead",
    published: true,
    testCases: [
      { id: "CA102-t1", problemId: "CA102", label: "Sample 1", kind: "sample", input: "4\n3 1 4 2", output: "20", weight: 1, explanation: "Cooking in order 1, 2, 3, 4 minutes gives completion times 1, 3, 6 and 10, for a total of 20." },
      { id: "CA102-t2", problemId: "CA102", label: "Sample 2", kind: "sample", input: "1\n7", output: "7", weight: 1 },
      { id: "CA102-t3", problemId: "CA102", label: "Already sorted", kind: "hidden", input: "3\n1 2 3", output: "10", weight: 1, inputFileName: "03.in", outputFileName: "03.out" },
    ],
    referenceSolution: {
      language: "cpp",
      source:
        "#include <bits/stdc++.h>\nusing namespace std;\nint main(){int n;cin>>n;vector<long long>t(n);for(auto&x:t)cin>>x;sort(t.begin(),t.end());\n long long cur=0,ans=0;for(auto x:t){cur+=x;ans+=cur;}cout<<ans;}\n",
    },
    editorial:
      "Shortest processing time first is optimal: swapping any adjacent pair where the longer order comes first strictly decreases the total. Sort ascending and sum the running prefix sums.",
  },
  {
    id: "CA103",
    code: "C",
    title: "Recipe Dependencies",
    difficulty: "hard",
    points: 300,
    topics: ["graphs", "dynamic-programming"],
    statement: [
      "A banquet menu has `n` recipes and `m` dependencies. A dependency `u v` means recipe `u` must be fully cooked before recipe `v` can start.",
      "Every recipe takes exactly one hour, and there are enough cooks to prepare any number of recipes in parallel. Find the minimum number of hours needed to cook every recipe, or report `-1` if the dependencies are contradictory.",
    ],
    inputFormat: [
      "The first line contains two integers `n` and `m`.",
      "Each of the next `m` lines contains two integers `u` and `v` (1 ≤ u, v ≤ n, u ≠ v).",
    ],
    outputFormat: ["Print the minimum number of hours, or `-1` if it is impossible."],
    constraints: ["1 ≤ n ≤ 2·10⁵", "0 ≤ m ≤ 2·10⁵"],
    timeLimitMs: 2000,
    memoryLimitMb: 256,
    languages: ["cpp", "java", "python", "go"],
    contestId: "weekly-41",
    author: "u_lead",
    published: true,
    testCases: [
      { id: "CA103-t1", problemId: "CA103", label: "Sample 1", kind: "sample", input: "4 3\n1 2\n2 3\n1 4", output: "3", weight: 1, explanation: "The chain 1 → 2 → 3 needs three consecutive hours; recipe 4 fits alongside." },
      { id: "CA103-t2", problemId: "CA103", label: "Sample 2", kind: "sample", input: "3 3\n1 2\n2 3\n3 1", output: "-1", weight: 1, explanation: "The dependencies form a cycle." },
      { id: "CA103-t3", problemId: "CA103", label: "No edges", kind: "hidden", input: "5 0", output: "1", weight: 1, inputFileName: "03.in", outputFileName: "03.out" },
      { id: "CA103-t4", problemId: "CA103", label: "Diamond", kind: "hidden", input: "4 4\n1 2\n1 3\n2 4\n3 4", output: "3", weight: 2, inputFileName: "04.in", outputFileName: "04.out" },
    ],
    referenceSolution: {
      language: "cpp",
      source:
        "#include <bits/stdc++.h>\nusing namespace std;\nint main(){int n,m;cin>>n>>m;vector<vector<int>>g(n+1);vector<int>in(n+1),d(n+1,1);\n for(int i=0;i<m;i++){int u,v;cin>>u>>v;g[u].push_back(v);in[v]++;}\n queue<int>q;for(int i=1;i<=n;i++)if(!in[i])q.push(i);int seen=0,best=0;\n while(!q.empty()){int u=q.front();q.pop();seen++;best=max(best,d[u]);for(int v:g[u]){d[v]=max(d[v],d[u]+1);if(--in[v]==0)q.push(v);}}\n cout<<(seen==n?best:-1);}\n",
    },
    editorial:
      "Run Kahn's topological sort. If not every vertex is popped there is a cycle. Otherwise the answer is the longest path measured in vertices, computed with a DP along the topological order.",
  },
  {
    id: "CA104",
    code: "A",
    title: "Sous-Chef Search",
    difficulty: "easy",
    points: 100,
    topics: ["binary-search", "arrays"],
    statement: [
      "The sous-chef logged `n` oven temperature readings in non-decreasing order. The head chef asks `q` questions: for a threshold `x`, how many readings are **at most** `x`?",
      "Answer every question quickly — a linear scan per query will not fit in the time limit.",
    ],
    inputFormat: [
      "The first line contains two integers `n` and `q`.",
      "The second line contains `n` integers in non-decreasing order.",
      "Each of the next `q` lines contains a single integer `x`.",
    ],
    outputFormat: ["For each query, print the answer on its own line."],
    constraints: ["1 ≤ n, q ≤ 2·10⁵", "0 ≤ readings, x ≤ 10⁹"],
    timeLimitMs: 1000,
    memoryLimitMb: 256,
    languages: ["cpp", "java", "python", "go"],
    contestId: "weekly-42",
    author: "u_lead",
    published: true,
    testCases: [
      { id: "CA104-t1", problemId: "CA104", label: "Sample 1", kind: "sample", input: "5 3\n2 4 4 7 9\n4\n1\n10", output: "3\n0\n5", weight: 1, explanation: "Readings 2, 4, 4 are at most 4. No reading is at most 1. Every reading is at most 10." },
      { id: "CA104-t2", problemId: "CA104", label: "Sample 2", kind: "sample", input: "1 2\n5\n5\n4", output: "1\n0", weight: 1 },
      { id: "CA104-t3", problemId: "CA104", label: "All equal", kind: "hidden", input: "4 2\n3 3 3 3\n3\n2", output: "4\n0", weight: 1, inputFileName: "03.in", outputFileName: "03.out" },
    ],
    referenceSolution: {
      language: "cpp",
      source:
        "#include <bits/stdc++.h>\nusing namespace std;\nint main(){ios::sync_with_stdio(0);cin.tie(0);int n,q;cin>>n>>q;vector<int>a(n);for(auto&x:a)cin>>x;\n while(q--){int x;cin>>x;cout<<upper_bound(a.begin(),a.end(),x)-a.begin()<<'\\n';}}\n",
    },
    editorial: "Because readings are sorted, the answer is upper_bound(x) — the index of the first reading greater than x. O((n + q) log n).",
  },
  {
    id: "CA105",
    code: "B",
    title: "Plating Patterns",
    difficulty: "medium",
    points: 200,
    topics: ["strings", "dynamic-programming"],
    statement: [
      "Chef arranges garnish along the rim of a plate following a pattern string `s` of lowercase letters. A pattern looks elegant when it reads the same from both ends — a palindrome.",
      "Chef may insert any letters at any positions. Find the minimum number of insertions needed to make `s` a palindrome.",
    ],
    inputFormat: ["A single line containing the string `s`."],
    outputFormat: ["Print the minimum number of insertions."],
    constraints: ["1 ≤ |s| ≤ 3000", "`s` consists of lowercase English letters."],
    timeLimitMs: 2000,
    memoryLimitMb: 256,
    languages: ["cpp", "java", "python", "go"],
    contestId: "weekly-42",
    author: "u_lead",
    published: true,
    testCases: [
      { id: "CA105-t1", problemId: "CA105", label: "Sample 1", kind: "sample", input: "abca", output: "1", weight: 1, explanation: "Insert 'b' to get \"abcba\"." },
      { id: "CA105-t2", problemId: "CA105", label: "Sample 2", kind: "sample", input: "chef", output: "3", weight: 1, explanation: "One optimal result is \"chefehc\"." },
      { id: "CA105-t3", problemId: "CA105", label: "Already a palindrome", kind: "hidden", input: "racecar", output: "0", weight: 1, inputFileName: "03.in", outputFileName: "03.out" },
    ],
    referenceSolution: {
      language: "cpp",
      source:
        "#include <bits/stdc++.h>\nusing namespace std;\nint main(){string s;cin>>s;int n=s.size();vector<vector<int>>dp(n,vector<int>(n,0));\n for(int len=2;len<=n;len++)for(int i=0;i+len-1<n;i++){int j=i+len-1;dp[i][j]=s[i]==s[j]?dp[i+1][j-1]:1+min(dp[i+1][j],dp[i][j-1]);}\n cout<<dp[0][n-1];}\n",
    },
    editorial: "Interval DP: dp[i][j] is the answer for s[i..j]. Matching ends inherit dp[i+1][j-1]; otherwise insert a copy of one end. Equivalently, n minus the longest palindromic subsequence.",
  },
  {
    id: "CA106",
    code: "C",
    title: "Menu Tree",
    difficulty: "hard",
    points: 300,
    topics: ["trees", "dynamic-programming"],
    statement: [
      "The tasting menu is organised as a tree of `n` dishes rooted at dish 1. Dish `i` has a flavour score `v[i]`. Two dishes connected by an edge clash, so they cannot both be served.",
      "Choose a set of dishes with no two directly connected and maximise the total flavour score.",
    ],
    inputFormat: [
      "The first line contains an integer `n`.",
      "The second line contains `n` integers `v[1], …, v[n]`.",
      "Each of the next `n − 1` lines contains two integers `a` and `b` describing an edge.",
    ],
    outputFormat: ["Print the maximum total flavour score."],
    constraints: ["1 ≤ n ≤ 2·10⁵", "1 ≤ v[i] ≤ 10⁹", "Beware of recursion depth on path-shaped trees."],
    timeLimitMs: 2000,
    memoryLimitMb: 256,
    languages: ["cpp", "java", "python", "go"],
    contestId: "weekly-42",
    author: "u_lead",
    published: true,
    testCases: [
      { id: "CA106-t1", problemId: "CA106", label: "Sample 1", kind: "sample", input: "5\n3 2 1 10 1\n1 2\n1 3\n2 4\n2 5", output: "14", weight: 1, explanation: "Serve dishes 1, 4 and 5 for 3 + 10 + 1 = 14." },
      { id: "CA106-t2", problemId: "CA106", label: "Sample 2", kind: "sample", input: "1\n5", output: "5", weight: 1 },
      { id: "CA106-t3", problemId: "CA106", label: "Path of three", kind: "hidden", input: "3\n4 9 4\n1 2\n2 3", output: "9", weight: 1, inputFileName: "03.in", outputFileName: "03.out" },
      { id: "CA106-t4", problemId: "CA106", label: "Star", kind: "hidden", input: "4\n10 3 3 3\n1 2\n1 3\n1 4", output: "10", weight: 2, inputFileName: "04.in", outputFileName: "04.out" },
    ],
    referenceSolution: {
      language: "cpp",
      source:
        "#include <bits/stdc++.h>\nusing namespace std;\nint main(){int n;cin>>n;vector<long long>v(n+1);for(int i=1;i<=n;i++)cin>>v[i];vector<vector<int>>g(n+1);\n for(int i=1;i<n;i++){int a,b;cin>>a>>b;g[a].push_back(b);g[b].push_back(a);}\n vector<int>order,par(n+1,0);order.reserve(n);order.push_back(1);par[1]=-1;\n for(size_t i=0;i<order.size();i++)for(int w:g[order[i]])if(w!=par[order[i]]){par[w]=order[i];order.push_back(w);}\n vector<array<long long,2>>dp(n+1,{0,0});for(int i=n-1;i>=0;i--){int u=order[i];dp[u][1]+=v[u];if(par[u]>0){dp[par[u]][0]+=max(dp[u][0],dp[u][1]);dp[par[u]][1]+=dp[u][0];}}\n cout<<max(dp[1][0],dp[1][1]);}\n",
    },
    editorial: "Tree DP with take/skip states. Process vertices in reverse BFS order to avoid deep recursion: skip[u] = Σ max(child states), take[u] = v[u] + Σ skip[child].",
  },
];
