import BinaryTreeExplorer from "@/components/member/BinaryTreeExplorer";

const BCBinaryTree = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold font-display">Binary Tree</h1>
      <p className="text-sm text-muted-foreground mt-1">Navigate your binary genealogy tree</p>
    </div>
    <BinaryTreeExplorer />
  </div>
);

export default BCBinaryTree;
