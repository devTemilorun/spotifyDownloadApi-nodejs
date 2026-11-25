declare module "node-id3" {
  const NodeID3: {
    write(tags: Record<string, unknown>, filePath: string): boolean;
  };
  export default NodeID3;
}
