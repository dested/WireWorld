(module
 (type $v (func))
 (type $iii (func (param i32 i32) (result i32)))
 (memory $0 0)
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
 (func $assembly/index/loadCopper (; 1 ;) (type $iii) (param $0 i32) (param $1 i32) (result i32)
  get_local $1
  i32.const 255
  i32.and
  get_local $0
  i32.const 3
  i32.shl
  i32.add
  i32.const 2
  i32.shl
  i32.load
 )
 (func $assembly/index/tick (; 2 ;) (type $v)
  (local $0 i32)
  (local $1 i32)
  (local $2 i32)
  (local $3 i32)
  (local $4 i32)
  (local $5 i32)
  (local $6 i32)
  (local $7 i32)
  loop $repeat|0
   block $break|0
    get_local $2
    i32.const 605129
    i32.ge_s
    br_if $break|0
    get_local $2
    i32.const 5446161
    i32.add
    i32.const 2
    i32.shl
    i32.load
    tee_local $6
    i32.eqz
    br_if $break|0
    i32.const 0
    set_local $3
    loop $repeat|1
     block $break|1
      get_local $3
      i32.const 8
      i32.ge_u
      br_if $break|1
      get_local $6
      get_local $3
      call $assembly/index/loadCopper
      tee_local $1
      i32.eqz
      br_if $break|1
      get_local $1
      i32.const 7261548
      i32.add
      i32.const 2
      i32.shl
      i32.load
      i32.eqz
      tee_local $0
      if (result i32)
       get_local $1
       i32.const 6051290
       i32.add
       i32.const 2
       i32.shl
       i32.load
       i32.eqz
       tee_local $0
      else       
       get_local $0
      end
      if (result i32)
       get_local $1
       i32.const 8471806
       i32.add
       i32.const 2
       i32.shl
       i32.load
       i32.eqz
      else       
       get_local $0
      end
      if
       i32.const 0
       set_local $0
       i32.const 0
       set_local $4
       loop $repeat|2
        block $break|2
         get_local $4
         i32.const 8
         i32.ge_u
         br_if $break|2
         get_local $1
         get_local $4
         call $assembly/index/loadCopper
         tee_local $7
         i32.eqz
         br_if $break|2
         get_local $7
         i32.const 6051290
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
         get_local $4
         i32.const 1
         i32.add
         set_local $4
         br $repeat|2
        end
       end
       get_local $0
       i32.const 0
       i32.gt_s
       if
        get_local $1
        i32.const 8471806
        i32.add
        i32.const 2
        i32.shl
        i32.const 1
        i32.store
        get_local $5
        i32.const 7866677
        i32.add
        i32.const 2
        i32.shl
        get_local $1
        i32.store
        get_local $5
        i32.const 1
        i32.add
        set_local $5
       end
      end
      get_local $3
      i32.const 1
      i32.add
      set_local $3
      br $repeat|1
     end
    end
    get_local $2
    i32.const 1
    i32.add
    set_local $2
    br $repeat|0
   end
  end
 )
 (func $null (; 3 ;) (type $v)
  nop
 )
)
