import { Card, CardContent } from '@/components/ui/card'
import React from 'react'

const ProjectCard = ({project, onEdit}) => {
   return (
      <Card className="py-0 group relative bg-slate-800/50 overflow-hidden hover:border-white/20 transition-all hover:transform hover:scale-[1.02]">
         <div className='aspect-video bg-slate-700 relative overflow-hidden'>
         {project.thumbnailUrl && (
            <img 
            src={project.thumbnailUrl}
            alt={project.title}
            className='w-full h-full object-cover'
            />
         )}
         </div>

         <CardContent>
            <p>Card Content</p>
         </CardContent>
      </Card>
   )
}

export default ProjectCard
