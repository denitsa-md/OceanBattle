

/*************************************************************************
 *  Compilation:  javac WordLadders.java
 *  Execution:    java WordLadders filename.txt
 *  Dependencies: StdIn.java StdOut.java SeparateChainingHashST<Key, Value>.java, 
 *                In.java, Stopwatch.java, Bag.java, Queue.java

 A word ladder puzzle begins with two words, and to solve the puzzle one must find a link 
 between the two, in which two adjacent words (that is, words in successive steps) 
 differ by one letter. This program takes an input file of words and finds shortest paths between 
 two words if such a path exists.

In a symbol table, unique 4 letter
sorted combinations are mapped from Strings to Bags of indexes for Strings that contain
those 4 letters. For two search words, Breadthfirst search is called to find the shortest path between them.

 *************************************************************************/

import edu.princeton.cs.algs4.StdOut;
import edu.princeton.cs.algs4.StdIn;
import edu.princeton.cs.algs4.Stopwatch;
import edu.princeton.cs.algs4.In;
import edu.princeton.cs.algs4.SeparateChainingHashST;
import edu.princeton.cs.algs4.Bag;
import edu.princeton.cs.algs4.Queue;
import java.io.FileNotFoundException;
import java.util.Arrays;
import java.util.Iterator;

public class WordLadders {
	private SeparateChainingHashST<String, Bag<Integer>> st;  // string -> index
	String[] a;

	public WordLadders(String filename) throws FileNotFoundException {
		st = new SeparateChainingHashST<String, Bag<Integer>>();
		Bag<Integer> bag;

		In in = new In(filename);
		while (!in.isEmpty()) {

			a = in.readAllStrings();
			for (int i = 0; i < a.length; i++) {
				for (int j = 0; j < a[i].length(); j++) {
					StringBuilder sb = new StringBuilder(a[i]);
					sb.deleteCharAt(j);
					String sbSorted = sort(sb.toString());
					if (!st.contains(sbSorted)) {	
						st.put(sbSorted,bag = new Bag<Integer>());
						bag.add(i);
					}
					else {
						bag = st.get(sbSorted);
						Iterator<Integer> iterator = bag.iterator();
						Integer next = iterator.next();
						if (!next.equals(i)){
							bag.add(i);

						}
					}
				}
			}
		}
	}

	public String sort (String s){
		char[] chars = s.toCharArray();
		Arrays.sort(chars);
		String sorted = new String(chars);
		return sorted;

	}
	/**
	 * Does the digraph contain the vertex named <tt>s</tt>?
	 * @param s the name of a vertex
	 * @return <tt>true</tt> if <tt>s</tt> is the name of a vertex, and <tt>false</tt> otherwise
	 */
	public boolean contains(String s) {
		return st.contains(s);
	}
	//Reused code from Algorithms, 4th Edition, Section 4.1 by Robert Sedgewick and Kevin Wayne. 
	public static class BreadthFirstDirectedPaths {
		private static final int INFINITY = Integer.MAX_VALUE;
		private boolean[] marked;  // marked[v] = is there an s->v path?
		private int[] edgeTo;      // edgeTo[v] = last edge on shortest s->v path
		private int[] distTo;      // distTo[v] = length of shortest s->v path

		/**
		 * Computes the shortest path from <tt>s</tt> and every other vertex in graph <tt>G</tt>.
		 * @param G the digraph
		 * @param s the source vertex
		 */
		public BreadthFirstDirectedPaths(WordLadders wl, int s) {
			marked = new boolean[wl.a.length];
			distTo = new int[wl.a.length];
			edgeTo = new int[wl.a.length];
			for (int v = 0; v < wl.a.length; v++) distTo[v] = INFINITY;
			bfs(wl, s);
		}

		// BFS from single source
		private void bfs(WordLadders wl, int s) {
			Queue<Integer> q = new Queue<Integer>();
			//  int searchWord = Arrays.asList(wl.a).indexOf(s);    
			marked[s] = true;
			distTo[s] = 0;
			q.enqueue(s);
			while (!q.isEmpty()) {
				int v = q.dequeue();
				String searchKey = wl.sort(wl.a[v].substring(1));

				for (int w : wl.st.get(searchKey)) {
					if (!marked[w]) {
						edgeTo[w] = v;
						distTo[w] = distTo[v] + 1;
						marked[w] = true;
						q.enqueue(w);
					}
				}
			}
		}
		/**
		 * Is there a directed path from the source <tt>s</tt> (or sources) to vertex <tt>v</tt>?
		 * @param v the vertex
		 * @return <tt>true</tt> if there is a directed path, <tt>false</tt> otherwise
		 */
		public boolean hasPathTo(int v) {
			return marked[v];
		}

		/**
		 * Returns a shortest path from <tt>s</tt> (or sources) to <tt>v</tt>, or
		 * <tt>null</tt> if no such path.
		 * @param v the vertex
		 * @return the sequence of vertices on a shortest path, as an Iterable
		 */
		public Iterable<Integer> pathTo(int v) {
			if (!hasPathTo(v)) return null;
			Stack<Integer> path = new Stack<Integer>();
			int x;
			for (x = v; distTo[x] != 0; x = edgeTo[x])
				path.push(x);
			path.push(x);
			return path;
		}

		/**
		 * Returns the number of edges in a shortest path from the source <tt>s</tt>
		 * (or sources) to vertex <tt>v</tt>?
		 * @param v the vertex
		 * @return the number of edges in a shortest path
		 */
		public int distTo(int v) {
			return distTo[v];
		}
	}

	public static void main(String[] args) throws FileNotFoundException, InterruptedException {
		StdOut.println("Type in the filename: ");
		String filename = StdIn.readString();
		Stopwatch buildData = new Stopwatch();
		WordLadders wl = new WordLadders(filename);
		double build = buildData.elapsedTime();
		StdOut.println("Enter two words separated by space:");
		String firstWord = "";
		String secondWord = "";
		String x = "";
		do{
			firstWord = StdIn.readString();
			secondWord = StdIn.readString();
			Stopwatch total = new Stopwatch();
			StdOut.println();
			int first = Arrays.asList(wl.a).indexOf(firstWord); 
			int second = Arrays.asList(wl.a).indexOf(secondWord); 
			BreadthFirstDirectedPaths bfs = new BreadthFirstDirectedPaths(wl, first);
			if (bfs.hasPathTo(second)) {
				Iterator<Integer> iterator = bfs.pathTo(second).iterator();
				while (iterator.hasNext()){
					int next = iterator.next();
					StdOut.print(wl.a[next]);
					if (iterator.hasNext()){
						StdOut.print(" -> ");
					}
				}
				StdOut.println("\n\nLength of path to " + secondWord + " is " + bfs.distTo(second) + ".");
				StdOut.println("Time to build data: " + build);
				StdOut.println("Time to find the path is: " + total.elapsedTime() + ".");

			} else {
				StdOut.println("No path.");
			}		
			StdOut.println("\nTo continue type \"y\". To exit type anything else.");
			x = StdIn.readString();
		} while(x.equals("y"));
	}
}

