'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface UserNode {
  id: string;
  name: string;
  amount: number; // positive = owed, negative = owes
}

interface RelationshipGraphProps {
  nodes: UserNode[];
}

export default function RelationshipGraph({ nodes }: RelationshipGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.graph-node',
        { scale: 0, opacity: 0, y: 20 },
        { scale: 1, opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'back.out(1.5)', delay: 0.2 }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="bg-card rounded-2xl p-6 shadow-sm border border-border w-full">
      <h3 className="text-xl font-semibold mb-6 text-foreground">Owe & Owed</h3>
      <div className="flex flex-col space-y-4">
        {nodes.map((node) => (
          <div key={node.id} className="graph-node flex items-center justify-between p-4 bg-muted/50 rounded-xl">
            <div className="flex items-center space-x-4">
              <div className="h-10 w-10 bg-primary/20 text-primary flex items-center justify-center rounded-full font-bold">
                {node.name.charAt(0)}
              </div>
              <span className="font-medium text-foreground">{node.name}</span>
            </div>
            <div className={`font-bold ${node.amount > 0 ? 'text-accent' : node.amount < 0 ? 'text-destructive' : 'text-foreground'}`}>
              {node.amount > 0 ? '+' : ''}₦{Math.abs(node.amount).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
