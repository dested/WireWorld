(module
 (type $v (func))
 (import "env" "memory" (memory $0 0))
 (table $0 1 anyfunc)
 (elem (i32.const 0) $null)
 (export "memory" (memory $0))
 (export "table" (table $0))
 (export "init" (func $assembly/index/init))
 (export "tick" (func $assembly/index/tick))
 (func $assembly/index/init (; 0 ;) (type $v)
  i32.const 800
  grow_memory
  drop
 )
 (func $assembly/index/tick (; 1 ;) (type $v)
  (local $0 i32)
  (local $1 i32)
  (local $2 i32)
  (local $3 i32)
  (local $4 i32)
  (local $5 i32)
  (local $6 i32)
  (local $7 i32)
  (local $8 i32)
  (local $9 i32)
  i32.const 21784644
  i32.load
  set_local $6
  i32.const 1
  set_local $3
  loop $repeat|0
   block $break|0
    get_local $3
    get_local $6
    i32.gt_u
    br_if $break|0
    get_local $3
    i32.const 5446161
    i32.add
    i32.const 2
    i32.shl
    i32.load
    tee_local $7
    i32.const 5
    i32.shl
    i32.load
    set_local $8
    i32.const 0
    set_local $4
    loop $repeat|1
     block $break|1
      get_local $4
      get_local $8
      i32.ge_u
      br_if $break|1
      get_local $7
      i32.const 3
      i32.shl
      get_local $4
      i32.add
      i32.const 1
      i32.add
      i32.const 2
      i32.shl
      i32.load
      tee_local $1
      i32.const 6065290
      i32.add
      i32.const 2
      i32.shl
      i32.load
      i32.eqz
      tee_local $0
      if
       get_local $1
       i32.const 5453161
       i32.add
       i32.const 2
       i32.shl
       i32.load
       i32.eqz
       set_local $0
      end
      get_local $0
      if
       get_local $1
       i32.const 6677419
       i32.add
       i32.const 2
       i32.shl
       i32.load
       i32.eqz
       set_local $0
      end
      get_local $0
      if
       i32.const 0
       set_local $0
       get_local $1
       i32.const 5
       i32.shl
       i32.load
       set_local $9
       i32.const 0
       set_local $5
       loop $repeat|2
        block $break|2
         get_local $5
         get_local $9
         i32.ge_u
         br_if $break|2
         get_local $1
         i32.const 3
         i32.shl
         get_local $5
         i32.add
         i32.const 1
         i32.add
         i32.const 2
         i32.shl
         i32.load
         i32.const 5453161
         i32.add
         i32.const 2
         i32.shl
         i32.load
         i32.const 1
         i32.eq
         if
          get_local $0
          i32.const 1
          i32.add
          tee_local $0
          i32.const 3
          i32.eq
          if
           i32.const 0
           set_local $0
           br $break|2
          end
         end
         get_local $5
         i32.const 1
         i32.add
         set_local $5
         br $repeat|2
        end
       end
       get_local $0
       i32.const 0
       i32.gt_s
       if
        get_local $1
        i32.const 6677419
        i32.add
        i32.const 2
        i32.shl
        i32.const 1
        i32.store
        get_local $2
        i32.const 6670420
        i32.add
        i32.const 2
        i32.shl
        get_local $1
        i32.store
        get_local $2
        i32.const 1
        i32.add
        set_local $2
       end
      end
      get_local $4
      i32.const 1
      i32.add
      set_local $4
      br $repeat|1
     end
    end
    get_local $3
    i32.const 1
    i32.add
    set_local $3
    br $repeat|0
   end
  end
  i32.const 26681676
  get_local $2
  i32.store
 )
 (func $null (; 2 ;) (type $v)
  nop
 )
)
